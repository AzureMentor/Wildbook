<%@ page contentType="text/html; charset=utf-8" language="java"
     import="org.ecocean.*,
              org.ecocean.servlet.ServletUtilities,
              java.util.ArrayList,
              java.util.List,
              java.util.Map,
              java.util.Vector,
              java.util.Iterator,
              java.util.Properties,
              java.util.StringTokenizer,
              org.datanucleus.api.rest.orgjson.JSONObject,
              org.datanucleus.api.rest.orgjson.JSONArray
              "
%>



<jsp:include page="header.jsp" flush="true"/>



<%

// All this fuss before the html is from individualSearchResults
String context="context0";
context=ServletUtilities.getContext(request);

Properties props = new Properties();
//String langCode = "en";
String langCode=ServletUtilities.getLanguageCode(request);
String urlLoc = "http://" + CommonConfiguration.getURLLocation(request);


//props.load(getClass().getResourceAsStream("/bundles/" + langCode + "/individualSearchResults.properties"));
props = ShepherdProperties.getProperties("individualSearchResults.properties", langCode,context);

// range of the images being displayed
int startNum = 1;
int endNum = 6;
try {
  if (request.getParameter("startNum") != null) {
    startNum = (new Integer(request.getParameter("startNum"))).intValue();
  }
  if (request.getParameter("endNum") != null) {
    endNum = (new Integer(request.getParameter("endNum"))).intValue();
  }
} catch (NumberFormatException nfe) {
  startNum = 1;
  endNum = 6;
}

int listNum = endNum;

int day1 = 1, day2 = 31, month1 = 1, month2 = 12, year1 = 0, year2 = 3000;
try {
  month1 = (new Integer(request.getParameter("month1"))).intValue();
} catch (Exception nfe) {
}
try {
  month2 = (new Integer(request.getParameter("month2"))).intValue();
} catch (Exception nfe) {
}
try {
  year1 = (new Integer(request.getParameter("year1"))).intValue();
} catch (Exception nfe) {
}
try {
  year2 = (new Integer(request.getParameter("year2"))).intValue();
} catch (Exception nfe) {
}

Shepherd myShepherd=null;
myShepherd=new Shepherd(context);

int numResults = 0;


Vector<MarkedIndividual> rIndividuals = new Vector<MarkedIndividual>();
myShepherd.beginDBTransaction();
String order ="";

request.setAttribute("rangeStart", startNum);
request.setAttribute("rangeEnd", endNum);
MarkedIndividualQueryResult result = IndividualQueryProcessor.processQuery(myShepherd, request, order);

rIndividuals = result.getResult();


if (rIndividuals.size() < listNum) {
  listNum = rIndividuals.size();
}

//check for and inject a default user 'tomcat' if none exists


%>


<script src="cust/mantamatcher/js/google_maps_style_vars.js"></script>
<script src="cust/mantamatcher/js/richmarker-compiled.js"></script>

<style>
  section.main-section.galleria div.row.gunit-row {
    background:#e1e1e1;
    padding-top:15px;
  }

  .gunit-row {
    position: relative;
  }

  .gallery-info {
    background: #4a494a;
    padding: 15px;
  }
  .gallery-info h2 {
    color: #16696d;
  }
  .gallery-info table {
    width: 100%;
  }
  .gallery-info td {
    width:50%;
  }


  .gallery-inner {
    background: #fff;
    padding: 5px;
  }
  .gallery-inner img {
    display: block;
    margin: auto;
  }
  .gallery-nav {
    margin-bottom: 0;
  }
  div.arrow-up {
  	width: 0;
  	height: 0;
  	border-left: 15px solid transparent;  /* left arrow slant */
  	border-right: 15px solid transparent; /* right arrow slant */
  	border-bottom: 15px solid #4a494a; /* bottom, add background color here */
  	font-size: 0;
  	line-height: 0;
    position: absolute;
    bottom: 0;
  }
  div.arrow-up.left {
    left: 25%;
  }
  div.arrow-up.right {
    left: 75%;
  }




</style>



<%


//let's quickly get the data we need from Shepherd

int numMarkedIndividuals=0;
int numEncounters=0;
int numDataContributors=0;

myShepherd.beginDBTransaction();

%>

<section class="gallery hero container-fluid main-section relative">
    <div class="container-fluid relative">
        <div class="col-lg-12 bc4">
            <!--<h1 class="hidden">Wildbook</h1>-->
            <h2 class="jumboesque">Tutustu Terttuun<br/> Ja Muihin Norppiin</h2>
            <!--
            <button id="watch-movie" class="large light">
				Watch the movie
				<span class="button-icon" aria-hidden="true">
			</button>
    -->
        </div>

	</div>

</section>
<nav class="navbar navbar-default gallery-nav">
  <div class="container-fluid">
    <button type="button" class="btn-link">Uusimmat havainnot</button>

    <button type="button" class="btn-link">Havainnot aleuittan</button>

    <button type="button" class="btn-link">Parhaiten tunnetut yksil&ouml;t</button>

  </div>
</nav>

<div class="container-fluid">
  <section class="container-fluid main-section front-gallery galleria">

      <%
      for (int i = 0; i < rIndividuals.size()/2 && i < 3; i++) {
        %>
        <div class="row gunit-row">
        <%
        MarkedIndividual[] pair = {rIndividuals.get(i*2), rIndividuals.get(i*2+1)};
        String[] pairUrl = new String[2];
        String[] pairName = new String[2];
        String[] pairNickname = new String[2];
        // construct a panel showing each individual
        for (int j=0; j<2; j++) {
          MarkedIndividual indie = pair[j];
          JSONObject maJson = indie.getExemplarImage(request);
          Boolean isFirst = (i==0)&&(j==0);
          pairUrl[j] = maJson.optString("url", urlLoc+"/cust/mantamatcher/img/hero_manta.jpg");
          pairName[j] = indie.getIndividualID();
          pairNickname[j] = pairName[j];
          if (!indie.getNickName().equals("Unassigned") && indie.getNickName()!=null && !indie.getNickName().equals("")) pairNickname[j] = indie.getNickName();
          %>
          <div class="col-xs-6">
            <div class="gallery-unit" id="gunit<%=i*2+j%>">
              <img src="<%=pairUrl[j]%>" id="<%=pairName[j]%>" alt="<%=pairNickname[j]%>" />
              <p><strong><%=pairNickname[j]%></strong></p>
            </div>
          </div>

          <script>
            console.log('Individual '+'<%=indie.getIndividualID()%>'+' has id <%=i%>');
          </script>

          <div id="arrow<%=i*2+j%>" class="arrow-up <%=(j==0) ? "left" : "right"%> <%=isFirst ? "active" : ""%> " style="display:<%=isFirst ? "block" : "none" %>;"></div>
          <%
        }
        %>
        </div>
        <div class="row">
        <%
        // now a second row containing each individual's info panel (hidden at first)
        for (int j=0; j<2; j++) {
          Boolean isFirst = (i==0)&&(j==0);
          %>
          <div class="col-sm-12 gallery-info <%=isFirst ? "active" : ""%>" id="ginfo<%=i*2+j%>" style="display:<%=((i==0)&&(j==0)) ? "block" : "none" %>;">


            <div class="gallery-inner">
              <img src="<%=pairUrl[j]%>" id="<%=pairName[j]%>" alt="<%=pairNickname[j]%>" />

              <h2><%=pairNickname[j]%></h2>
              <table><tr>
                <td>
                  <ul>
                    <li>
                      Name: <%=pairName[j]%>
                    </li>
                    <li>
                      Nickname: <%=pairNickname[j]%>
                    </li>
                    <li>
                      Sex: <%=pair[j].getSex()%>
                    </li>
                    <li>
                      Locations: <%=org.apache.commons.lang3.StringUtils.join(pair[j].participatesInTheseLocationIDs(),", ")%>
                    </li>
                  </ul>
                </td>
                <td>
                  <ul>
                    <li>
                      Living status: TODO
                    </li>
                    <li>
                      Nickname: <%=pairNickname[j]%>
                    </li>
                    <li>
                      Sex: <%=pair[j].getSex()%>
                    </li>
                    <li>
                      Locations: <%=org.apache.commons.lang3.StringUtils.join(pair[j].participatesInTheseLocationIDs(),", ")%>
                    </li>
                  </ul>
                </td>

              </tr></table>

            </div>
          </div>
          <%
        }
        %>
        </div>
        <%
      }

      %>
  </section>
</div>

<%
myShepherd.closeDBTransaction();
myShepherd=null;
%>


<script>

  $('.gallery-unit').click( function() {
    var thisId = this.id.split('gunit')[1];
    var target = '#ginfo'+thisId;
    var targetArrow = '#arrow'+thisId;
    if ($(target).hasClass('active')) {
      $(target).slideToggle(800, function() {
        $(targetArrow).hide(0, function() {
          $(target).removeClass('active');
          $(targetArrow).removeClass('active');
        });
      });
    }
    else {
      var currentPosition=''
      $('.gallery-info.active').hide(0, function() {
        $('.gallery-info.active').removeClass('active');
        $('div.arrow-up.active').hide(0, function() {
          $('div.arrow-up.active').removeClass('active');
        })
      });
      $(targetArrow).toggle(0, function() {
        $(targetArrow).addClass('active');
        $(target).slideToggle(800);
        $(target).addClass('active');
      })
    }
  });

  // a little namespace for gallery functions
  var gallery = {};

</script>


<jsp:include page="footer.jsp" flush="true"/>
