$(document).ready(function (){

  $('.torrent').each(function(index, o) {
    updateTorrent(o);

    setInterval(function(){
      updateTorrent(o);
    }, 5000);

  }); 

  function updateTorrent(o){

    hash = o.id;

    $.get('/torrents/info?hash=' + hash, function(data){

      var torrent = $('#' + data['hash']);

      console.log(hash);

      var progress = $(torrent).find('.progress');

      if (data['d.is_active'] == "1") {
        $(progress).addClass('progress-success');
        $(progress).addClass('active');
        $(progress).removeClass('progress-danger');

      } else {
        $(progress).addClass('progress-danger');
        $(progress).removeClass('active');
        $(progress).removeClass('progress-success');
      }

      var bar = $(torrent).find('.bar');
      var nameSpan = $(bar).find('.name');
      var progressSpan = $(bar).find('.progress');

      var percentComplete = (parseInt(data['d.completed_bytes']) / parseInt(data['d.size_bytes'])) * 100;
      percentComplete = roundNumber(percentComplete, 2);
      bar.attr('style', 'width:' + percentComplete + '%;');

      var speedUp = roundNumber(parseFloat(data['d.up.rate']) / 1024, 2);
      var speedDown = roundNumber(parseFloat(data['d.down.rate']) / 1024, 2);

      nameSpan.text(data['d.base_filename'] + ' - ' + percentComplete + '% ' + speedDown + 'Kbps dn - ' + speedUp + 'Kbps up');
    });
  }

  function roundNumber(num, dec) {
    var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
    return result;
  }
});

