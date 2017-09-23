var fs = require('fs'),
    path = require('path'),
    Twit = require('twit'),
    http = require('http'),
    nyplCaptures = require('public-domain-nypl-captures'),
    config = require(path.join(__dirname, 'config.js'));

var request = require('request').defaults({ encoding: null });
var T = new Twit(config);


var title = '';
var imageURL = '';


function execute(){

  function getImage(){

    var opts = {
      filterOutBrokenImageLinks: true,
      maxRetries: 5,
      validSizes: [
        'w',
        'r'
      ]
    };

    function logCapture(error, capture) {
      if (error) {
        console.log(error, error.stack);
      }
      else {
        imageURL = capture["preferredImageURL"];
        title = capture["title"];
        title.slice(0,140);
      }
    }

    nyplCaptures.getRandomCapture(opts, logCapture);

  }


  function uploadImage(){


    request.get(imageURL, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            data = new Buffer(body).toString('base64');

            T.post('media/upload', { media_data: data }, function (err, data, response) {
              if (err){
                console.log(err);
              }
              else{
                console.log('Image uploaded!');
                console.log('Now tweeting it...');

                T.post('statuses/update', {
                  media_ids: new Array(data.media_id_string),
                  status: title
                },
                  function(err, data, response) {
                    if (err){
                      console.log('ERROR:');
                      console.log(err);
                    }
                    else{
                      console.log('Posted an image!');
                    }
                  }
                );
              }
          });
        }
    });

  }

  getImage();

  setTimeout(uploadImage, 5000);

}


execute();

