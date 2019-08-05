<%@ page contentType="text/html; charset=utf-8" language="java" 
        import="org.ecocean.CommonConfiguration,
        java.util.Properties, 
        org.ecocean.servlet.ServletUtilities,
        org.ecocean.*,
        java.util.Properties,
        java.util.List,
        java.util.ArrayList"        
%>

<%
/*
Hello! This page consists mostly of anchor points that we add components to using JS. 
The JS you want is in /javascript/multipleSubmit/
*/
    String langCode = ServletUtilities.getLanguageCode(request);
    String context=ServletUtilities.getContext(request);
    Properties props = new Properties();
    props = ShepherdProperties.getProperties("multipleSubmit.properties", langCode,context);
    Properties recaptchaProps = new Properties();
    recaptchaProps = ShepherdProperties.getProperties("recaptcha.properties", "");
    long maxMediaSize = CommonConfiguration.getMaxMediaSizeInMegabytes(context);
    String baseUrl = CommonConfiguration.getServerURL(request, request.getContextPath());
%>

<script> 
// Only use to convey property values to JS file
var tempBytes = "<%=maxMediaSize%>";
console.log("tempBytes (in MB) = "+tempBytes);
if (tempBytes!=""&&tempBytes!=undefined&&!isNaN(tempBytes)) {
    maxBytes = (parseInt(tempBytes)*1048576);
}
</script>

<jsp:include page="../header.jsp" flush="true"/>
<div id="root-div" class="container-fluid maincontent">
    <div class="row">
        <div class="col-xs-12 col-lg-12">
            <div class="container">
                <h2><%= props.getProperty("pageHeader")%></h2>
                <h4><b><%= props.getProperty("headerDesc")%></b></h4>
                <p id="instructionsBody"><%= props.getProperty("instructionsBody")%></p>
                <p><a href="<%=baseUrl%>/multipleSubmit/instructions.jsp"><%= props.getProperty("instructionsLink")%></a></p>
            </div>  
            <hr>
                <!-- specify number of encounters in two input items -->

                <div class="container form-file-selection">

                    <div id="file-drop-area" class="pad-bottom col-xs-12 col-sm-4 col-md-4 col-lg-4 col-xl-4">
                        <input class="btn btn-large btn-file-selector" type="button" onclick="document.getElementById('file-selector-input').click()" value="Select Files" />
                    </div>
                    

                    <div class="form-file-selection pad-bottom  col-xs-12 col-sm-4 col-md-4 col-lg-4 col-xl-4">
                        <label><%= props.getProperty("specifyEncNum")%></label>
                        <div class="input-group">
                            <input id="number-encounters" class="form-control" type="number" name="number-encounters" required value="1" min="1" max="48">
                        </div>
                    </div>

                    <div class="recaptcha-div form-define-metadata pad-bottom col-xs-12 col-sm-4 col-md-4 col-lg-4 col-xl-4">
                        <!-- Recaptcha widget -->
                        <div id="recaptcha-div">
                            <%= ServletUtilities.captchaWidget(request) %>
                        </div>
                    </div>

                    <br>
                    <hr>

                    <div class="nav-buttons col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                        <!-- next page -->
                        <button class="" id="continueButton" type="button" disabled onclick="continueButtonClicked();"><%= props.getProperty("continue")%></button>
                    </div>

                </div>

                <input id="file-selector-input" name="allFiles" class="hidden-input" type="file" accept=".jpg, .jpeg, .png, .bmp, .gif, .mov, .wmv, .avi, .mp4, .mpg" style="display:none;" multiple size="50" onChange="updateSelected(this);" />
                <div id="file-list-container" class="container">
                    <p id="input-file-list"></p>    
                    <p class="action-message"> </p>
                </div>

                <br class="form-spacer">

                <!-- easy place to store this -->
                <input id="recaptcha-checked" name="recaptcha-checked" type="hidden" value="false" />

                <br class="form-spacer">

                <!-- Here is where we are going to put UI to define encounter metadata from JS -->
                <div id="metadata-tiles-main" class="row"></div>

                <br class="form-spacer">

                <div id="gallery-header" class="row"></div>

                <!-- Here is where we are going to dump rendered images and encounter UI from JS -->
                <div id="image-tiles-main" class="row"></div>

                <!-- here is where we list the created encs -->
                <div id="results-main" class="row"></div>

                <div class="nav-buttons container">
                    <hr>
                    <!-- next page
                    <button class="" id="continueButton" type="button" disabled onclick="continueButtonClicked();"><%= props.getProperty("continue")%></button>
                    -->
                    <!-- back to file selection -->
                    <button class="hidden-input" id="backButton" type="button" onclick="backButtonClicked();"><%= props.getProperty("back")%></button>
                    <!-- actually done now, send it off -->
                    <button class="hidden-input" id="sendButton" type="button" disabled onclick="sendButtonClicked();"><%= props.getProperty("complete")%></button>
                </div>

                <br>

                <div id="missing-data-message" class="container"></div>                
        </div> 
        <hr>
    </div>
</div>

<jsp:include page="../footer.jsp" flush="true"/>
