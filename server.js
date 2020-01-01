const express = require('express');
//const mongoose = require('mongoose');
const formidable = require('formidable');
const bodyParser = require('body-parser');
const assert = require('assert');
const app = express();
const fs = require('fs');

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));


var ExifImage = require('exif').ExifImage;

//show information
app.post('/show', (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    console.log(JSON.stringify(files));
    if (files.fileupload.size == 0) {
        res.status(500).end("No file uploaded!"); 
    }
    const filename = files.fileupload.path;
      var title = "untitled";
      var mimetype = "images/jpeg";
      var description = "n/a";
      var image = "n/a";
	  var make = "n/a";
	  var model = "n/a";
	  var createDate = "n/a";
	  var final_lat = 0.0;
	  var final_lon = 0.0;
	 
      if (fields.title.length > 0 ) {
        title = fields.title;
		console.log(`title = ${title}`);
      }
      if (fields.description.length > 0 ) {
        description = fields.description;
		console.log(`description = ${description}`);
      }
      if (files.fileupload.type) {
        mimetype = files.fileupload.type;
		console.log(`mimetype = ${mimetype}`);
      }

      fs.readFile(filename, (err,data) => {
      image = "data:" + mimetype + ";base64, " + new Buffer.from(data).toString('base64');

    });
	
	  try {
    		new ExifImage({ image : filename }, function (error, exifData) {
                if (error)
            		console.log('Error: '+error.message);
        		else {
					//console.log(exifData);
					//make = exifData.image.Make;
					//console.log("Make: " + make);
		        	//model = exifData.image.Model;
					//console.log("Model: " + model);
					//createDate = exifData.exif.CreateDate;
					//console.log("Date: " + createDate);

					lat = convert(exifData.gps.GPSLatitude[0], exifData.gps.GPSLatitude[1], exifData.gps.GPSLatitude[2], exifData.gps.GPSLatitudeRef);
					lon = convert(exifData.gps.GPSLongitude[0], exifData.gps.GPSLongitude[1], exifData.gps.GPSLongitude[2], exifData.gps.GPSLongitudeRef);
					//console.log("lat:" + final_lat);
					//console.log("lon:" + final_lon);

					res.render('show.ejs', {title: title,
				 				 description : description, 
								 image: image,
				 			 	 make : exifData.image.Make,
				 				 model : exifData.image.Model, 
				 				 createDate : exifData.exif.CreateDate,
								 lat : lat,
								 lon : lon} );
				}
    		});
	  } catch (error) {
    		console.log('Error: ' + error.message);
	  }

})
})
function convert(degrees, minutes, seconds, direction) {
    	var x = degrees + (minutes/60) + (seconds/3600);
    	if (direction == "S" || direction == "W") {
        	x = x * -1; 
        }
    	return x;
}

//map
app.get('/map', (req, res) => {	
	res.render('gps.ejs', {
	    lat : req.query.lat,
		lon : req.query.lon,
		zoom: req.query.zoom ? req.query.zoom : 20
	})
})


app.get('/', (req,res) => {
  res.render('upload.ejs');
  res.end();
});

app.get('/upload', (req,res) => {
  res.render('upload.ejs');
  res.end();
});
 
app.listen(process.env.PORT || 8099);
