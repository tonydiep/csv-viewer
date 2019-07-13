import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { HttpClient, HttpHeaders  } from '@angular/common/http'
import 'rxjs/add/operator/map';
import xml2js from 'xml2js';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(public navCtrl: NavController, public http: HttpClient) { }


  xmlItems: any;

  ionViewWillEnter() {
    this.loadXML();

    this.loadCSV();
  }

  public csvItems: any;

  loadCSV() {
    this.http.get('/assets/data/comics.csv', {responseType: 'text'})
      .subscribe((data) => {
        let csv = this.parseCSVFile(data);
        this.csvItems = csv;
      });
  }


  parseCSVFile(str) {
    var arr = [],
      obj = [],
      row,
      col,
      c,
      quote = false;  // true means we're inside a quoted field

    // iterate over each character, keep track of current row and column (of the returned array)
    for (row = col = c = 0; c < str.length; c++) {
      var cc = str[c],
        nc = str[c + 1];        // current character, next character

      arr[row] = arr[row] || [];
      arr[row][col] = arr[row][col] || '';

      /* If the current character is a quotation mark, and we're inside a
    quoted field, and the next character is also a quotation mark,
    add a quotation mark to the current column and skip the next character
      */
      if (cc == '"' && quote && nc == '"') {
        arr[row][col] += cc;
        ++c;
        continue;
      }


      // If it's just one quotation mark, begin/end quoted field
      if (cc == '"') {
        quote = !quote;
        continue;
      }


      // If it's a comma and we're not in a quoted field, move on to the next column
      if (cc == ',' && !quote) {
        ++col;
        continue;
      }


      /* If it's a newline and we're not in a quoted field, move on to the next
         row and move to column 0 of that new row */
      if (cc == '\n' && !quote) {
        ++row;
        col = 0;
        continue;
      }

      // Otherwise, append the current character to the current column
      arr[row][col] += cc;
    }

    return this.formatParsedObject(arr, true);
  }



  formatParsedObject(arr, hasTitles) {
    let id,
      title,
      publisher,
      genre,
      obj = [];

    for (var j = 0; j < arr.length; j++) {
      var items = arr[j];

      if (items.indexOf("") === -1) {
        if (hasTitles === true && j === 0) {
          id = items[0];
          title = items[1];
          publisher = items[2];
          genre = items[3];
        }
        else {
          obj.push({
            id: items[0],
            title: items[1],
            publisher: items[2],
            genre: items[3]
          });
        }
      }
    }
    return obj;
  }



  loadXML() {
    this.http.get(
      '/assets/data/comics.xml',
      {
        headers: new HttpHeaders()
          .set('Content-Type', 'text/xml')
          .append('Access-Control-Allow-Methods', 'GET')
          .append('Access-Control-Allow-Origin', '*')
          .append('Access-Control-Allow-Headers', "Access-Control-Allow-Headers, Access-Control-Allow-Origin, Access-Control-Request-Method"),
        responseType: 'text'
      })
      .subscribe((data) => {
        this.parseXML(data).then((data) => {
          this.xmlItems = data;
        })
      });

  }

  parseXML(data) {
    return new Promise(resolve => {
      let k;
      let arr = [];
      let parser = new xml2js.Parser({
        trim: true,
        explicitArray: true
      });

      parser.parseString(data, function (err, result) {
        let obj = result.comics;
        for (k in obj.publication) {
          let item = obj.publication[k];
          arr.push({
            id: item.id[0],
            title: item.title[0],
            publisher: item.publisher[0],
            genre: item.genre[0]
          });
        }
        resolve(arr);
      })
    })
  }
}
