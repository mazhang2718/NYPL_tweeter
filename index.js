var fs = require('fs'),
    path = require('path'),
    Twit = require('twit'),
    http = require('http'),
    nyplCaptures = require('public-domain-nypl-captures'),
    config = require(path.join(__dirname, 'config.js'));

var request = require('request').defaults({ encoding: null });

var T = new Twit(config);
var title = '';


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
        var imageURL = capture["preferredImageURL"];
        title = capture["title"];
        title.slice(0,140);

        var file = fs.createWriteStream("images/file.jpg");
        var request = http.get(imageURL, function(response) {
          response.pipe(file);
        });
      }
    }

    nyplCaptures.getRandomCapture(opts, logCapture);

  }


  function uploadImage(){
    var image_path = path.join(__dirname, '/images/file.jpg'),
        b64content = fs.readFileSync(image_path, { encoding: 'base64' });

    T.post('media/upload', { media_data: b64content }, function (err, data, response) {
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


  getImage();

  setTimeout(uploadImage, 5000);

}


execute();


// setInterval(function(){
//   execute;
// }, 10000);

