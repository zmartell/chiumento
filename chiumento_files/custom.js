

/* INITIATE JS ELEMENTS */
$("#tabs").tabs({
  disabled: [1, 2, 3 ],
  show: function(ev, ui) {
    if (ui.index <= 2) {
      $(".indicators, .indicators-reports").accordion("resize");
    };
  }
});

$(".indicators, .indicators-reports").accordion({
  active: 0,
  clearStyle: true
});

/* DRAG DROP */

indcount = $(".indicators h3").length;
var data = {};
var questions = {};

$("#tabs .indicators div ul.drag-to").sortable({
  items: "li",
  placeholder: "drophover",
  handle: '.handlebar',
  start: function(ev, ui) {

   ui.item.css('border', 'solid 1px #888');
   ui.placeholder.css('border', 'solid 1px #888')
     .css('border-top', 'none');

  },
  stop: function(ev, ui) {
    ui.item.removeAttr('style');
  },
  update: function(ev, ui) {
   ui.item.removeAttr('style');

   if ($(this).find("li:not(:empty) a").length == 5) {
     var answers = [];
     var ansText = [];

     $(this).find("li a").each(function(index) {
       sel = $(this, "a");
       type = $(sel).attr("class").split("-")[1].charAt(0);
       text = $(sel).text();

       answers.push(type);
       ansText.push(text);
     });

     $(this).parent().prev("h3").addClass("ui-state-complete");
     var cur = $(this).parent().attr("id").split("-")[1];

     data[cur] = answers;

     question = $(this).parent().prev("h3").text();
     questions[cur] = {"question":question, "answers":ansText};

     done = $(".indicators h3.ui-state-complete").length;

     if(indcount == done){

       //console.log(data);
       //console.log(questions);

       getReports(data, questions);
     }
   }

  }

});

$("#tabs .indicators div ul.drag-from li a").draggable({
  'revert': true
});

$("#tabs .indicators div ul.drag-to li").droppable({
  hoverClass: 'drophover',
  activeClass: 'candrop',
  accept: "#tabs .indicators div ul.drag-from li a",

  drop: function(ev, ui) {

	cont = $(this).html();
	if(cont){
		return;
	}
	
    var dropped = ui.draggable;

    $(this).prepend('<span class="handlebar ui-icon ui-icon-arrowthick-2-n-s"></span>');
    $(dropped).detach().css({top: 0,left: 0}).clone().appendTo($(this));
    $(dropped).remove();

    if ($(this).parent().find("li:not(:empty) a").length == 5) {

      
      var answers = [];
      var ansText = [];

      $(this).parent().find("li a").each(function(index) {
        type = $(this).attr("class").split("-")[1].charAt(0);
        text = $(this).text();

        answers.push(type);
        ansText.push(text);
      });

      $(this).parent().parent().prev("h3").addClass("ui-state-complete");
      var cur = $(this).parent().parent().attr("id").split("-")[1];

      data[cur] = answers;

      question = $(this).parent().parent().prev("h3").text();
      questions[cur] = {"question":question, "answers":ansText};

      done = $(".indicators h3.ui-state-complete").length;

      if(indcount == done){

        //alert(JSON.stringify(data));
        //alert(JSON.stringify(questions));
        //console.log(data);
        //console.log(questions);
    	  
		jQuery(document).ready(function() {
			$.fancybox.showActivity();
		});
    	  
        getReports(data, questions);
      }

    } else {
      $(this).parent().parent().prev('h3').removeClass('ui-state-complete');
    }
  }
});

/* AJAX */
if($(".indicators-print").length > 0){
  $.ajax({
    type: "POST",
    url: "core/php/controller.php",
    data: {"a":"loadReports"},
    success: function(reports) {
      //console.log(reports);
      processReportData(reports, true);
    }
  });
}

function getReports(data, questions) {
	
  $.ajax({
    type: "POST",
    url: "core/php/controller.php",
    data: {"calcs":data,"a":"calc", "questions": questions},
    success: function(reports) {
      //console.log(reports);
      //alert(reports);
      processReportData(reports);
      
      jQuery(document).ready(function() {
    		$.fancybox.hideActivity();
    	});
    }
  });
}

function processReportData(reports, print) {
  reports = JSON.parse(reports);

  // interactive report
  injectReport(reports);

  // graph
  injectGraph(reports);

  // print page
  injectPrint(reports);
}

function injectReport(reports) {
  reps = $(".indicators-reports");

  $.each(reports.calcs.types, function(key, val) {
    $(".r-"+key+"-score").text(val);
  });

  $.each(reports.report, function(key, indtext) {
    $("#r-"+key+"-result .overview").html(indtext.overview);
    $("#r-"+key+"-result .result").html(indtext.result);
  });

  $("#tabs").tabs("enable",1);

}

function injectPrint(reports) {

  html = "";

  $.each(reports.questions, function(key, val){
    html += "<div class='qwrap'><h4>Q"+key+". "+val.question+"</h4>";
    html += "<ul>";

    $.each(val.answers, function (key, val){
      html += "<li>"+val+"</li>";
    });

    html += "</ul></div>";
  });


  $("#p-ranking").html(html);
  
  $("#p-ranking .qwrap:odd").after("<div class='clearfix'></div>");

  $.each(reports.report, function(key, indtext) {
    //$("#p-"+key+"-result .overview").html(indtext.overview);
    $("#p-"+key+"-result .result").html(indtext.result);
  });

  $("#tabs").tabs("enable",3);
}

function injectGraph(reports) {
  pav = reports.calcs.av["P"];
  mav = reports.calcs.av["M"];
  aav = reports.calcs.av["A"];
  cav = reports.calcs.av["C"];
  tav = reports.calcs.av["T"];

  pu = reports.calcs.totals["P"];
  mu = reports.calcs.totals["M"];
  au = reports.calcs.totals["A"];
  cu = reports.calcs.totals["C"];
  tu = reports.calcs.totals["T"];

  var data,options;

  var d1 = [ [3,cu], [0,pu], [1,mu], [4,tu], [2,au], ];
  var d2 = [ [3,cav], [0,pav], [1,mav], [4,tav], [2,aav] ];

  options = {
    series: {
      spider: {
        active: true,
        legs: {
          data: [
            {label: "Socialiser"},
            {label: "Protectionist"},
            {label: "Materialist"},
            {label: "True Believer"},
            {label: "Achiever"}
          ],
          legStartAngle: 270,
        },
        spiderSize: 0.9
      }
    },
    grid: {
      hoverable: false,
      clickable: false,
      tickColor: "rgba(0,0,0,0.2)",
      mode: "spider"
    }
  };

  data = [
  {
    label: "You",
    data: d1,
    spider: {show: false, lineWidth: 12},
    color: "#4F81BD"
  },
  {
    label: "Average",
    data: d2,
    spider: {show: true},
    color: "#BE4B48"
  }
  ];

  $.plot($(".spidergraph"), data , options);
  if($(".spidergraph2").length > 0){
    $.plot($(".spidergraph2"), data , options);
  }

  $("#tabs").tabs("enable",2);
}

