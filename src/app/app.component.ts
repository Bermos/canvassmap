import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GoogleMap, MapMarker} from '@angular/google-maps';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;
  title = 'Canvass Map';
  zoom = 12;
  center: google.maps.LatLngLiteral;
  heatmap: google.maps.visualization.HeatmapLayer;
  heatmapData: [];
  options: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    disableDefaultUI: true,
    zoomControl: true,
  };
  locations = {
    seattle: {
      name: 'Seattle',
      coords: {lat: 47.6453116, lng: -122.3311617},
      canvassesUrl: 'assets/seattle_WA-canvasses.json',
      doorsUrl: 'assets/seattle_WA-doors.json',
    }
  };
  markers = [];
  colors = {
    '2020-03-05': '001e95',
    '2020-03-06': '009bb6',
    '2020-03-07': '00ca4f',
    '2020-03-08': 'dddd00',
    '2020-03-09': 'ec8e00',
    '2020-03-10': 'ee1700',
    '2020-03-11': 'f000ef'
  };
  colorList = [
    {date: 'Thu Mar 05', color: '001e95'},
    {date: 'Fri Mar 06', color: '009bb6'},
    {date: 'Sat Mar 07', color: '00ca4f'},
    {date: 'Sun Mar 08', color: 'dddd00'},
    {date: 'Mon Mar 09', color: 'ec8e00'},
    {date: 'Tue Mar 10', color: 'ee1700'},
    {date: 'Wen Mar 11', color: 'f000ef'}
  ];
  labelIconUrl = 'https://mt.googleapis.com/vt/icon/name=icons/onion/SHARED-mymaps-pin-container-bg_4x.png,icons/onion/SHARED-mymaps-pin-container_4x.png,icons/onion/1899-blank-shape_pin_4x.png&highlight=ff000000,';
  private loc;
  private selectedEvent;

  constructor(private http: HttpClient) {
  }

  ngOnInit() {
    this.loc = this.locations.seattle;
    this.loadLocation(this.loc);
  }

  loadLocation(loc) {
    this.center = loc.coords;

    // Fetch door data for current location
    this.http.get(loc.doorsUrl).subscribe((data: []) => {
      this.heatmapData = [];
      data.forEach(door => {
        this.heatmapData.push({
          location: new google.maps.LatLng(door.Latitude, door.Longitude),
          weight: door.Count > 200 ? 0 : door.Count
        });
      });

      this.heatmap = new google.maps.visualization.HeatmapLayer({
        data: this.heatmapData,
        dissipating: true,
        radius: 40,
        maxIntensity: 400,
        map: this.map.data.getMap(),
      });
    });

    // Fetch canvass data for current location
    this.http.get(loc.canvassesUrl).subscribe((data: []) => {
      data.forEach(canvass => {
        // @ts-ignore
        this.markers.push({
          position: {
            lat: canvass.Latitude,
            lng: canvass.Longitude,
          },
          label: canvass.attendee_count.toString(),
          title: [canvass.title, canvass.day + ', ' + canvass.time, canvass.address1, canvass.postal + ', ' + canvass.region].join('\n'),
          options: {
            animation: google.maps.Animation.DROP,
            icon: this.labelIconUrl + this.colors[canvass.date],
          },
          info: canvass,
        });
      });
    });
  }

  setNewRadius() {
    if (this.heatmap) {
      this.heatmap.setOptions({data: this.heatmapData, radius: Math.pow(2, this.map.getZoom()) / 100});
    }
  }

  openInfo(marker: MapMarker, markerInfo) {
    this.selectedEvent = markerInfo;
  }
}
