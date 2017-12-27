package org.ecocean.servlet;

import org.json.JSONObject;

import com.amazonaws.Request;

import java.io.*;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.Map.Entry;
import java.util.concurrent.TimeUnit;

import org.ecocean.*;
import org.ecocean.genetics.TissueSample;
import org.ecocean.servlet.*;
import org.ecocean.tag.DigitalArchiveTag;
import org.ecocean.tag.SatelliteTag;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.ecocean.media.*;
import org.apache.poi.ss.usermodel.DataFormatter;

import javax.jdo.*;
import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class GenerateNOAAReport extends HttpServlet {
  /**
   * 
   */
  
  private static final long serialVersionUID = 1L;
  private static PrintWriter out;
  private static String context; 
  private static String[] SEARCH_FIELDS = new String[]{"startDate","endDate", "permitName", "speciesName", "reportType", "numSpecies"}; 
  private int photoIDNum = 0;
  private int physicalIDNum = 0;
  private String completeSummary = "";
  private ArrayList<Occurrence> satTagOccs = new ArrayList<Occurrence>();
  private ArrayList<Occurrence> dTagOccs = new ArrayList<Occurrence>();

  public void init(ServletConfig config) throws ServletException {
    super.init(config);
  }

  public void doGet(HttpServletRequest request,  HttpServletResponse response) throws ServletException,  IOException {
    doPost(request,  response);
  }
  
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException,  IOException { 
    out = response.getWriter();
    context = ServletUtilities.getContext(request);
    System.out.println("=========== Generating data for NOAA report. ===========");
    Shepherd myShepherd = new Shepherd(context);
    myShepherd.setAction("GenerateNOAAReport.class");
    String urlLoc = "//"+CommonConfiguration.getURLLocation(request);
    response.setContentType("text/html");
    request.setAttribute("returnLoc", "//"+urlLoc+"/generateNOAAReport.jsp");

    //int groupTotal = 0;
    String physicalReport = "<hr><h4>Detail Photo Sample Results:</h4><br/>";
    physicalReport += "<table class=\"table\">";    
    physicalReport += "<tr><th scope=\"col\">Date</th><th scope=\"col\">Species</th><th scope=\"col\">Permit Name</th><th scope=\"col\">Sample State</th><th scope=\"col\">Group Size</th></tr>";

    String photoIDReport = "<hr><h4>Detail Physical Sample Results:</h4><br/>";
    photoIDReport += "<table class=\"table\">"; 
    photoIDReport += "<tr><th scope=\"col\">Date</th><th scope=\"col\">Species</th><th scope=\"col\">Permit Name</th><th scope=\"col\">Photo Number</th><th scope=\"col\">Takes</th></tr>";

    String taggingReport = "<hr><h4>Detail Tag Results:</h4><br/>";
    taggingReport += "<table class=\"table\">";
    taggingReport += "<tr><th scope=\"col\">Date</th><th scope=\"col\">Species</th><th scope=\"col\">Tag Type</th><th scope=\"col\">Tag ID</th></tr>";

    HashMap<String,String> formInput = null;
    try {
      formInput = retrieveFields(request, SEARCH_FIELDS);  
    } catch (Exception e) {
      System.out.println("Could not retrieve fields to query for NOAA report...");
      e.printStackTrace();
    }

    String reportType = formInput.get("reportType");

    // Tag report MUST follow photoID. The proper occs are extracted at the same time to save the DB a hit. 
    if (reportType.equals("photoID")) {
      photoIDReport = photoIDReporting(photoIDReport,formInput,myShepherd,request);
    } else {
      physicalReport = physicalSampleReporting(physicalReport,formInput,myShepherd,request); 
      photoIDReport = photoIDReporting(photoIDReport,formInput,myShepherd,request);
      taggingReport = taggingReport(taggingReport, formInput, myShepherd, request);
    }
    String report = "";
    if (reportType=="photoID") {
      report = photoIDReport;
    } else {
      report = photoIDReport + physicalReport + taggingReport;
    }
    
    request.setAttribute("reportType",reportType);
    request.setAttribute("completeSummary",completeSummary);
    request.setAttribute("physicalIDNum", String.valueOf(physicalIDNum));
    request.setAttribute("photoIDNum", String.valueOf(photoIDNum));
    request.setAttribute("result",report);
    request.setAttribute("returnUrl","//"+urlLoc+"/reporting/generateNOAAReport.jsp");
    try {
      getServletContext().getRequestDispatcher("/reporting/NOAAReport.jsp").forward(request, response);                
    } catch (Exception e) {
      e.printStackTrace();
    } finally {
      myShepherd.closeDBTransaction();
      out.close();  
      photoIDNum = 0;
      physicalIDNum = 0;
      completeSummary = "";
    }
  }

  private String taggingReport(String report, HashMap<String,String> formInput, Shepherd myShepherd, HttpServletRequest request) {
    String row = "";
    for (Occurrence occ : satTagOccs) {  
      if (occ.getBaseSatelliteTagArrayList()!=null&&!occ.getBaseSatelliteTagArrayList().isEmpty()) {
        ArrayList<SatelliteTag> sTags = occ.getBaseSatelliteTagArrayList();
        String date = millisToShortDate(occ.getMillis());
        for (SatelliteTag sTag : sTags) {
          row =  buildTagRow(sTag, date);
          report += row;
        }
      }
    }
    for (Occurrence occ : dTagOccs) {  
      if (occ.getBaseDigitalArchiveTagArrayList()!=null&&!occ.getBaseDigitalArchiveTagArrayList().isEmpty()) {
        ArrayList<DigitalArchiveTag> dTags = occ.getBaseDigitalArchiveTagArrayList();
        for (DigitalArchiveTag dTag : dTags) {
          String date = millisToShortDate(occ.getMillis());
          row = buildTagRow(dTag, date);
          report += row;
        }
      }
    }
    report += "</table>";
    return report;
  }

  private String buildTagRow(SatelliteTag sTag, String date) {
    Observation species = sTag.getObservationByName("Species");
    Observation tagIDOb = sTag.getObservationByName("Tag_ID");
    Observation tagTypeOb = sTag.getObservationByName("TagType");
    System.out.println("Obs in Tag??? "+sTag.getAllObservations().toString());
    String speciesStr = null;
    if (species!=null&&species.getValue()!=null) {
      speciesStr = species.getValue();        
    }
    String tagID = sTag.getId();
    if (tagIDOb!=null&&tagIDOb.getValue()!=null) {
      tagID = tagIDOb.getValue();        
    }
    String tagType = sTag.getId();
    if (tagTypeOb!=null&&tagTypeOb.getValue()!=null) {
      tagType = tagTypeOb.getValue();        
    }

    String row = "<tr>";
    row += "<td>"+date+"</td>";
    row += "<td>"+speciesStr+"</td>";
    row += "<td>Satellite "+tagType+"</td>";
    row += "<td>"+tagID+"</td>";
    row += "</tr>";
    return row;
  }

  private String buildTagRow(DigitalArchiveTag dTag, String date) {
    Observation species = dTag.getObservationByName("Species");
    Observation tagIDOb = dTag.getObservationByName("Tag_ID");
    System.out.println("Obs in Tag??? "+dTag.getAllObservations().toString());
    String speciesStr = null;
    if (species!=null&&species.getValue()!=null) {
      speciesStr = species.getValue();   
    }
    String tagID = dTag.getId();
    if (tagIDOb!=null&&tagIDOb.getValue()!=null) {
      tagID = tagIDOb.getValue();        
    }
    
    String row = "<tr>";
    row += "<td>"+date+"</td>";
    row += "<td>"+speciesStr+"</td>";
    row += "<td>D Tag</td>";
    row += "<td>"+tagID+"</td>";
    row += "</tr>";
    return row;
  }

  private void checkForTag(Occurrence occ) {
    if (occ.getBaseDigitalArchiveTagArrayList()!=null&&!occ.getBaseDigitalArchiveTagArrayList().isEmpty()) {
      dTagOccs.add(occ);
      System.out.println("Got a dTag!");
    } else if (occ.getBaseSatelliteTagArrayList()!=null&&!occ.getBaseSatelliteTagArrayList().isEmpty()) {
      satTagOccs.add(occ);
      System.out.println("Got a Sat tag!");
    }
  }

  private String photoIDReporting(String report,HashMap<String,String> formInput, Shepherd myShepherd, HttpServletRequest request) {
    
    HashMap<String,ArrayList<String>> takesCounts = new HashMap<>();
    
    @SuppressWarnings("unchecked")
    Iterator<Occurrence> occs = myShepherd.getAllOccurrences();
    while (occs.hasNext()) {
      Occurrence occ = occs.next();
      long startDate = -999;
      long endDate = -999;
      long milliDate = -999;
      String shortDate  = null;
      try {
        milliDate = getMilliOccDate(occ, myShepherd);               
        //System.out.println("Sample Date in PhotoID: "+milliDate);
        if (formInput.containsKey("startDate")&&formInput.containsKey("endDate")) {
          startDate = milliComparator(formInput.get("startDate"));
          endDate = milliComparator(formInput.get("endDate"));
          if (startDate>milliDate||endDate<milliDate) {
            continue;
          }
          shortDate = millisToShortDate(milliDate);
        }
      } catch (NullPointerException npe) {
        npe.printStackTrace();
      }
      
      ArrayList<String> speciesArr = new ArrayList<>();
      boolean allSpecies = false;
      int numSpecies = 0;
      if (request.getParameter("allSpecies")!=null) {
        allSpecies = Boolean.valueOf((request.getParameter("allSpecies")));
        //System.out.println("All Species? "+(request.getParameter("allSpecies")));
      }
      try {
        numSpecies = Integer.valueOf(formInput.get("numSpecies"));
        //System.out.println("Number of species? "+numSpecies);
        for (int i=0;i<numSpecies;i++) {
          String name = "speciesName"+i;
          if (request.getParameter(name)!=null) {
            speciesArr.add(request.getParameter(name).toLowerCase());
            //System.out.println("Species added to list: "+request.getParameter(name).toLowerCase());
          }
        }
      } catch (Exception e) {
        e.printStackTrace();
      }

      // This is where it gets weird. Checkng for tags here because species and date are in common. This is shoehorned in,
      // I know. 
      checkForTag(occ);


      Encounter enc = occ.getEncounters().get(0);
      String species = null;
      if (enc!=null) {
        species = (enc.getGenus()+" "+enc.getSpecificEpithet()).toLowerCase();
      }
      if (!allSpecies&&!speciesArr.contains(species)) {
        continue;
      } else {
        species = species.substring(0,1).toUpperCase() + species.substring(1);
      }

      String photos = null;
      String estimate = null;
      try {
        Observation photoNum = occ.getObservationByName("PHOTOS (#)");
        Observation est = occ.getObservationByName("TOTBESTEST");
        if (photoNum!=null&&est!=null) {
          photos = photoNum.getValue();
          estimate = est.getValue();
        }
        if (photoNum==null||photoNum.getValue().equals("0")||est==null||est.getValue().equals("0")) {
          continue;
        } 
      } catch (NullPointerException npe) {
        npe.getStackTrace();
      }
      photoIDNum++;

      report += "<tr>";
      report += "<td>"+shortDate+"</td>";
      report += "<td>"+species+"</td>";
      report += "<td>"+"Permit for photoID?"+"</td>";
      report += "<td>"+photos+"</td>";
      report += "<td>"+estimate+"</td>";
      report += "</tr>";

      takesCounts = aggregatePhotoTakes(takesCounts, species, photos, estimate);
    }
    report += "</table>";

    createPhotoIDSummary(takesCounts);

    return report;
  }

  private void createPhotoIDSummary(HashMap<String,ArrayList<String>> takesCounts) {
    String summary = "";
    if (takesCounts.keySet()!=null&&!takesCounts.keySet().isEmpty()) {
      summary += "<h3>Summary of Photo ID takes:</h3>";
      summary += "<table class=\"table\">";
      summary += "<tr><th scope=\"col\">Species</th><th scope=\"col\">Photo #&nbsp&nbsp&nbsp</th><th scope=\"col\">Takes (TOTBESTEST)</th></tr>";
      Set<String> keys = takesCounts.keySet();
      for (String key : keys) {
        summary += "<tr>";
        summary += "<td>"+key+"</td>";
        summary += "<td>"+takesCounts.get(key).get(0)+"</td>";
        summary += "<td>"+takesCounts.get(key).get(1)+"</td>";
        summary += "</tr>";
      }
      summary += "</table>";
    } else {
      summary += "<tr><td>No Results.</td></tr></table>";
    }
    completeSummary += summary; 
  }

  private HashMap<String,ArrayList<String>> aggregatePhotoTakes(HashMap<String,ArrayList<String>> takesCounts, String species, String photos, String estimate) {
    if (takesCounts.containsKey(species)) {
      ArrayList<String> values = takesCounts.get(species);
      try {
        photos = sanitizeIntString(photos);
        estimate = sanitizeIntString(estimate);
        String oldPhotos =  sanitizeIntString(values.get(0));
        String oldEstimate = sanitizeIntString(values.get(1));
        values.set(0, String.valueOf(Integer.valueOf(oldPhotos)+Integer.valueOf(photos)));
        values.set(1, String.valueOf(Integer.valueOf(oldEstimate)+Integer.valueOf(estimate)));
        takesCounts.replace(species, values);
      } catch (Exception e) {
        e.printStackTrace();
      }
    } else {
      ArrayList<String> newSpecies = new ArrayList<>();
      newSpecies.add(0, photos);
      newSpecies.add(1, estimate);
      takesCounts.put(species, newSpecies);
    }
    return takesCounts;
  }

  private String sanitizeIntString(String intStr) {
    String sanitized = "";
    for (int i=0;i<intStr.length();i++) {
      Character ch = intStr.charAt(i);
      if (Character.isDigit(ch)) {
        sanitized = sanitized + ch.toString();
      }
    }
    return sanitized;
  }

  private String physicalSampleReporting(String report,HashMap<String,String> formInput, Shepherd myShepherd, HttpServletRequest request) {
    // Yuck.
    HashMap<String,ArrayList<String>> takesCounts = new HashMap<String,ArrayList<String>>();
    Iterator<TissueSample> allSamples = null;
    try {
      allSamples = myShepherd.getAllTissueSamplesNoQuery().iterator();
    } catch (Exception e) {
      System.out.println("Could not retrieve Tissue Samples for NOAA report...");
      e.printStackTrace();
    } 
    
    long startDate = -999;
    long endDate = -999;
    while (allSamples.hasNext()) {
      TissueSample sample = allSamples.next();
      // Verify ts has the same permit, or use all.
      String permitName = "All";
      String permitFromSample = "";
      if (formInput.containsKey("permitName")&&formInput.get("permitName")!=null) {
        permitName = formInput.get("permitName");
        permitFromSample = sample.getPermit();
        if ((!permitName.equals("all"))&&!permitFromSample.toLowerCase().equals(permitName.toLowerCase())) {
          System.out.println("Rejected based on non matching Permit selection!");
          continue;
        }
      }
      
      Long sampleDate = null;
      String shortDate  = null;
      try {
        sampleDate = getAnyDate(sample, myShepherd);                
        shortDate = getShortDate(sample, myShepherd);
        //System.out.println("Sample Date: "+sampleDate);
        if (formInput.containsKey("startDate")) {
          startDate = milliComparator(formInput.get("startDate"));
          if (startDate>sampleDate) {
            //System.out.println("Rejected based on being outside start date bounds! Start Date: "+startDate);
            continue;
          }
        }
        if (formInput.containsKey("endDate")) {
          endDate = milliComparator(formInput.get("endDate"));
          if (endDate<sampleDate) {
            //System.out.println("Rejected based on being outside end date bounds! End Date: "+endDate);
            continue;
          }
        }
      } catch (NullPointerException npe) {
        npe.printStackTrace();
      }
      
      ArrayList<String> speciesArr = new ArrayList<>();
      boolean allSpecies = false;
      int numSpecies = 0;
      if (request.getParameter("allSpecies")!=null) {
        allSpecies = Boolean.valueOf((request.getParameter("allSpecies")));
        System.out.println("All Species? "+(request.getParameter("allSpecies")));
      }
      try {
        numSpecies = Integer.valueOf(formInput.get("numSpecies"));
        //System.out.println("Number of species? "+numSpecies);
        for (int i=0;i<numSpecies;i++) {
          String name = "speciesName"+i;
          if (request.getParameter(name)!=null) {
            speciesArr.add(request.getParameter(name).toLowerCase());
            //System.out.println("Species added to list: "+request.getParameter(name).toLowerCase());
          }
        }
      } catch (Exception e) {
        e.printStackTrace();
      }

      Encounter enc = myShepherd.getEncounter(sample.getCorrespondingEncounterNumber());
      String species = null;
      if (enc!=null) {
        species = (enc.getGenus()+" "+enc.getSpecificEpithet()).toLowerCase();
      }
      String obSpecies = sample.getObservationByName("Species_ID").getValue().toLowerCase();
      if (!allSpecies&&!speciesArr.contains(species)&&!speciesArr.contains(obSpecies)) {
        continue;
      } else if (species==null&&obSpecies.length()>0) {
        species = obSpecies.substring(0,1).toUpperCase() + obSpecies.substring(1);
      }
      
      Integer groupSize = getPhysicalSamplingGroupSize(myShepherd,sample);
      
      String state = "Unspecified";
      if (sample.getState()!=null) {
        state = sample.getState();
      }
      physicalIDNum++;

      report += "<tr>";
      report += "<td>"+shortDate+"</td>";
      report += "<td>"+species+"</td>";
      report += "<td>"+permitFromSample+"</td>";
      report += "<td>"+state+"</td>";
      report += "<td>"+groupSize+"</td>";
      report += "</tr>";

      takesCounts = aggregatePhysicalTakes(takesCounts, species, groupSize);
    } 
    report += "</table>";

    createPhysicalIDSummary(takesCounts);
    return report;
  }

  private void createPhysicalIDSummary(HashMap<String,ArrayList<String>> takesCounts) {
    String summary = "";
    if (takesCounts.keySet()!=null&&!takesCounts.keySet().isEmpty()) {
      summary += "<h3>Summary of Physical ID takes:</h3>";
      summary += "<table class=\"table\">";
      summary += "<tr><th scope=\"col\">Species</th><th scope=\"col\">Group Totals</th><th scope=\"col\">Actual Biopsies</th></tr>";
      Set<String> keys = takesCounts.keySet();
      System.out.println("Takescounts? "+takesCounts.toString());
      for (String key : keys) {
        summary += "<tr>";
        summary += "<td>"+key+"</td>";
        // Zero index of arraylist is the groupSize, one is the actual samples.
        summary += "<td>"+takesCounts.get(key).get(0)+"</td>";
        summary += "<td>"+takesCounts.get(key).get(1)+"</td>";
        summary += "</tr>";
      }
      summary += "</table>"; 
    } else {
      summary += "<tr><td>No Reselts.</td></tr></table>";
    }
    completeSummary += summary; 
  }

  //Aggregate actual samples + groupSize.
  private HashMap<String,ArrayList<String>> aggregatePhysicalTakes(HashMap<String,ArrayList<String>> takesCounts, String species, Integer groupSize) {
    ArrayList<String> takes = new ArrayList<String>(2);
    if (takesCounts.containsKey(species)) {
      takes = takesCounts.get(species);
      try {
        String group = takes.get(0);
        String numBiopsies = takes.get(1);
        group = String.valueOf(Integer.valueOf(group) + groupSize);
        numBiopsies = String.valueOf(Integer.valueOf(numBiopsies) + 1);
        takes.set(0, group);
        takes.set(1, numBiopsies);
        takesCounts.replace(species, takes);
      } catch (Exception e) {
        e.printStackTrace();
      } 
    } else {
      takes.add(0, String.valueOf(groupSize));
      takes.add(1,"1");
      takesCounts.put(species, takes);
    }
    return takesCounts;
  }

  private Integer getPhysicalSamplingGroupSize(Shepherd myShepherd, TissueSample sample) {
    Integer groupSize = null;
    try {
      Observation groupOb = sample.getObservationByName("Group_Size");
      if (groupOb!=null&&groupOb.getValue()!=null&&!"".equals(groupOb.getValue())) {
        groupSize = Integer.valueOf(groupOb.getValue());
      } else {
        groupSize = 1;
      }
    } catch (NullPointerException npe) {
      npe.printStackTrace();
    }
    return groupSize;  
  }
  
  private HashMap<String,String> retrieveFields(HttpServletRequest request, String[] SEARCH_FIELDS) {
    HashMap<String,String> data = new HashMap<>();  
    for (String field : SEARCH_FIELDS) {
      if (request.getParameter(field)!=null&&!request.getParameter(field).equals("")) {
        String fieldContent = request.getParameter(field).toString().trim();
        data.put(field, fieldContent);
      }
    }
    return data;
  }
  
  private long milliComparator(String date) {
    date = formatDate(date);
    if (date.length()>11) {
      date = date.substring(0, 10);
    }
    DateFormat fm = new SimpleDateFormat("MM/dd/yyyy");
    Date d = null;
    try {
      d = (Date)fm.parse(date);
    } catch (ParseException pe) {
      pe.printStackTrace();
    }
    DateTime dt = new DateTime(d);
    return dt.getMillis();
  }
  
  private String formatDate(String date) {
    date = date.replace("-", "/");
    if (date.length()>11) {
      date = date.substring(0, 10);
    }
    if (date.split("/")[0].length()>2) {
      String[] dateSplit = date.split("/");
      date = dateSplit[1]+"/"+dateSplit[2]+"/"+dateSplit[0];
      //Awkward split glue from yyyy/mm/dd to mm/dd/yyyy
    }
    //System.out.println("NOAA Report format date: "+date);
    return date;
  }

  private String getShortDate(TissueSample ts, Shepherd myShepherd) {
    if (ts.getObservationByName("date")!=null) {
      try {
        String strDate = ts.getObservationByName("date").getValue();
        //System.out.println("Date from Observation? "+strDate);
        strDate = formatDate(strDate);

        return strDate;
      } catch (Exception e) {
        e.printStackTrace();
      }
    }  
    return null;
  }

  private long getAnyDate(TissueSample ts, Shepherd myShepherd) {
    long anyDate =  -999; 
    if (ts.getObservationByName("date")!=null) {
      try {
        String strDate = ts.getObservationByName("date").getValue();
        System.out.println("Date from Observation? "+strDate);
        strDate = formatDate(strDate);
        System.out.println("Formatted date? "+strDate);
        anyDate = milliComparator(formatDate(strDate));
        return anyDate;
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
    if (anyDate==-999) {
      String parentID = ts.getCorrespondingEncounterNumber();
      try {
        if (myShepherd.isEncounter(parentID)) {
          Encounter enc = myShepherd.getEncounter(parentID);
          anyDate = enc.getDateInMilliseconds();
          return anyDate;
        }
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
    if (anyDate==-999) {
      String parentID = ts.getCorrespondingOccurrenceNumber();
      try {
        if (myShepherd.isOccurrence(parentID)) {
          Occurrence occ = myShepherd.getOccurrence(parentID);
          // Throwing here.. Null check or alternative?
          if (occ.getMillis()!=null) {
            anyDate = occ.getMillis();
          }
          return anyDate;
        }
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
    return anyDate;
  }

  private long getMilliOccDate(Occurrence occ, Shepherd myShepherd) {
    long milliDate = -999;
    Encounter enc = occ.getEncounters().get(0);
    try {
      milliDate = enc.getDateInMilliseconds();
    } catch (Exception e) {
      e.printStackTrace();
    }
    return milliDate;
  }

  private String millisToShortDate(long millis) {
    DateTime dt = new DateTime(millis);
    String shortDate = dt.toString().substring(0,10);
    String[] dateSplit = shortDate.split("-");
    shortDate = dateSplit[1]+"/"+dateSplit[2]+"/"+dateSplit[0];
    return shortDate;
  }

}





















