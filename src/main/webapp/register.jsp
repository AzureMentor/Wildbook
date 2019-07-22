<%@ page contentType="text/html; charset=utf-8" 
		language="java"
        import="org.ecocean.servlet.ServletUtilities,org.ecocean.*, java.util.Properties" %>
<style>
label {
    font-size: 0.9em;
    width: 12em;
}

#survey-section p {
    margin-top: 30px;
}

#survey-section .top {
    vertical-align: top;
}

</style>
<%

String context = ServletUtilities.getContext(request);

  //setup our Properties object to hold all properties
  //String langCode = "en";
  String langCode=ServletUtilities.getLanguageCode(request);
  boolean loggedIn = !AccessControl.isAnonymous(request);

    String modeString = request.getParameter("mode");
    boolean instrOnly = Util.requestParameterSet(request.getParameter("instructions"));

//set up the file input stream
  Properties props = new Properties();
  //props.load(getClass().getResourceAsStream("/bundles/" + langCode + "/login.properties"));
  props = ShepherdProperties.getProperties("login.properties", langCode,context);

    int mode = -1;
    try {
        mode = Integer.parseInt(modeString);
    } catch (NumberFormatException nfe) {};


    int fromMode = -2;
    try {
        fromMode = Integer.parseInt(request.getParameter("fromMode"));
    } catch (NumberFormatException nfe) {};

    if (fromMode == -1) {
        mode = 0;

    } else if (fromMode == 0) {
        mode = 1;

    } else if (fromMode == 1) {
        mode = 2;

    } else if (fromMode == 2) {
        mode = 3;
    }

    if (instrOnly) mode = 3;

    //////session.setAttribute("error", "<b>FAKE</b> error fromMode=" + fromMode);
%>



  <!-- Make sure window is not in a frame -->


<jsp:include page="header.jsp" flush="true"/>

<div class="container maincontent">

              <h1 class="intro">Participating in Kitizen Science</h1>

              <p align="left">
		
<div style="padding: 10px;" class="error">
<%
if (session.getAttribute("error") != null) {
	out.println("<p class=\"error\">" + session.getAttribute("error") + "</p>");
	session.removeAttribute("error");
}

%>
</div>
              
<% if (mode < 0) { %>

<div class="explanation-section">

<p>
Our first phase of validation tests are running from now until September 29, 2019.  This validation test is looking at how good humans are at by-eye photo identifications of cats taken with smart phones.  You can read the
<a href="register.jsp?instructions">instructions page</a>
first to see more about what this trial involves.
</p>

<%  if (loggedIn) { %>
    <b>You are logged in already.  <a href="compare.jsp">Please proceed to study.</a></b>
<% } else { %>

<p>
    <form method="post">
    <input type="submit" value="Register to Participate" />
    <input type="hidden" name="fromMode" value="-1" />
    </form>
</p>

<% } %>

</div>

<% }
if (mode == 0) {
%>

<div id="consent-section">
<h2>
UNIVERSITY OF WASHINGTON -
CONSENT FORM
</h2>

<h3>Testing Volunteers' Ability to Identify Individual Cats from Photos</h3>

<p>
<b>Researcher: Sabrina Aeluro, graduate student at the University of Washington<br />
Study email: kitizenscience@gmail.com</b>
</p>

<h3>
Researcher's statement and purpose of study
</h3>

<p>
The purpose of this study is to test volunteers' abilities to make correct photo identifications of free-roaming cats using an online citizen science platform.  The cat photos in this study are of outdoor cats in their normal environment, and no cats were harmed in the collection of these photos.  This study is open to all people over the age of 18 who are interested in cats.
</p>

<p>
The purpose of this consent form is to give you the information you will need to help you decide whether to be in the study or not.  Please read the form carefully.  You may ask questions about the purpose of the research, what we would ask you to do, the possible risks and benefits, your rights as a volunteer, and anything else about the research or this form that is not clear.  When we have answered all your questions, you can decide if you want to be in the study or not.  This process is called “informed consent.”  You may save a copy of this form for your records.
</p>

<h3>
Study procedures
</h3>

<p>
After registering for the study website, this study starts with a short survey about volunteers' backgrounds and personal demographics, and then participants will be presented with photo matching trials.  Once a trial has started, volunteers will be shown two photos and asked to select whether the same cat is pictured in both photos.  Volunteers can do as many or as few matching trials as they like.
</p>

<h3>
Risks, stress, or discomfort
</h3>

<p>
This study is designed with the aim to be minimally intrusive, inoffensive, and is not intended to cause stress or place subjects at risk.
</p>

<h3>
Alternatives to taking part in this study
</h3>

<p>
You have the option to not take part in this study.
</p>

<h3>
Benefits of the study
</h3>

<p>
While there is no individual benefit or compensation for participating in this study, your answers will help validate the methods of Kitizen Science, a new citizen science program for monitoring the impacts of spay/neuter programs on free-roaming cat populations.
</p>

<h3>
Confidentiality of research information
</h3>

<p>
The study does not require the collection of any personally identifying information apart from an email address.  Your email address is confidential and will not be published as part of this research.  While efforts are taken to ensure the privacy and security of your responses, in the event of a data breach, your survey answers and photo matching data could be linked to you email address.
</p>

<p>
Government or university staff sometimes review studies such as this one to make sure they are being done safely and legally.  If a review of this study takes place, your responses may be examined.  The reviewers will protect your privacy.  The study records will not be used to put you at legal risk of harm.
</p>

<h3>
Other information
</h3>

<p>
You may refuse to participate and you are free to withdraw from this study at any time without penalty or loss of benefits to which you are otherwise entitled.
</p>

<h3>
Research-related injury
</h3>

<p>
If you think you have been harmed from being in this research, contact Sabrina Aeluro via the study email address: kitizenscience@gmail.com.  The UW does not normally provide compensation for harm except through its discretionary program for medical injury.  However, the law may allow you to seek other compensation if the harm is the fault of the researchers.  You do not waive any right to seek payment by signing this consent form.
</p>

<h3>
Subject's statement 
</h3>

<p>
This study has been explained to me.  I volunteer to take part in this research.  I have had a chance to ask questions.  If I have questions later about the research, or if I have been harmed by participating in this study, I can contact the researcher listed on this consent form.  If I have questions about my rights as a research subject, I can call the University of Washington Human Subjects Division at 206-543-0098 or call collect at 206-221-5940.
</p>

<p>
I consent to participate in this study.
</p>


<div>
<form method="post">
    <input type="submit" value="Yes" />
    <input type="hidden" name="fromMode" value="0" />

    <input type="button" value="No" onClick="window.location.href='./';" />
</form>
</div>

</div>


<% }
if (mode == 1) {
    Properties recaptchaProps = ShepherdProperties.getProperties("recaptcha.properties", "", context);
%>

<div id="register-section">
<h2>Register an account</h2>


<form method="post">
<input type="hidden" name="fromMode" value="1" />

<div>
	<label for="username">Username</label>
	<input type="text" id="username" name="username" maxlength="50" />
</div>
<div>
	<label for="email">Email address</label>
	<input type="email" id="email" name="email" class="ui-autocomplete-input" maxlength="50" />
</div>

<div>
    <label>Password</label>
    <input type="password" name="password1" />
</div>
<div>
    <label>Password (confirm)</label>
    <input type="password" name="password2" />
</div>

<div>
    <label for="agree-terms">Agree to terms (etc)?</label> <input id="agree-terms" name="agree-terms" type="checkbox" />
</div>


<div id="myCaptcha" style="margin-top: 20px;"></div>
<script>
    var captchaWidgetId;
    function onloadCallback() {
        captchaWidgetId = grecaptcha.render(
            'myCaptcha', {
                'sitekey' : '<%=recaptchaProps.getProperty("siteKey") %>',
                'theme' : 'light'
            }
        );
    }
</script>
<script src="https://www.google.com/recaptcha/api.js?render=explicit&onload=onloadCallback"></script>

<input type="submit" name="submit" value="Register" />

</form>


</div>
              
<% }
if (mode == 2) {
%>
<div id="survey-section">
<form method="post">

<h2>Survey</h2>

<p>
We would like you to answer this short survey about yourself so we can understand our audience and your experience.  The demographic questions are included so that we can compare participants in Kitizen Science with other citizen science projects.  Specifically, we are interested in knowing whether the demographics of Kitizen Science are similar, or different, from other projects.
</p>

<p>
Are you currently involved in volunteering with cats in some way?
<select class="top" name="cat_volunteer">
<option>No</option>
<option>Yes</option>
</select>
</p>

<p>
Do you have a disability or personal limitation (such as being a parent/caregiver) that prevents you from volunteering with cats in a typical offline setting like a shelter?
<select class="top" name="disability">
<option>No</option>
<option>Yes</option>
<option>Sometimes</option>
</select>
</p>

<p>
Do you currently have a cat/cats in your care?
<select class="top" name="have_cats" multiple>
<option>Yes, a pet cat/cats</option>
<option>Yes, I care for feral/free-roaming cats</option>
<option>No</option>
</select>
</p>

<p>
Have you ever participated in an online citizen science project doing image identification or classification?
<select class="top" name="citsci_participate">
<option>No</option>
<option>Yes</option>
</select>
</p>

<p>
What is your current age?
<select class="top" name="age">
<option>18</option>
<option>100</option>
</select>
</p>

<p>
Are you retired?
<select class="top" name="retired">
<option>No</option>
<option>Yes</option>
</select>
</p>

<p>
What is your gender?
<select class="top" name="retired">
<option>Woman</option>
<option>Man</option>
<option>Nonbinary/Other</option>
</select>
</p>

<p>
What is your race/ethnicity (select multiple if appropriate):
<select class="top" name="ethnicity" multiple>
<option>American Indian or Alaska Native</option>
<option>Black or African American</option>
<option>Hispanic or Latino</option>
<option>Middle Eastern</option>
<option>Native Hawaiian or Pacific Islander</option>
<option>White</option>
</select>
</p>

<p>
Highest level of education:
<select class="top" name="education">
<option>Less than high school</option>
<option>High school</option>
<option>Technical school, Associate's degree, or some college</option>
<option>Bachelor's degree</option>
<option>Graduate/professional degree</option>
</select>
</p>

<p>
How did you hear about Kitizen Science?
<textarea style="width: 30em; height: 5em;" class="top" name="how_hear"></textarea>
</p>

<input type="hidden" name="fromMode" value="2" />

<input type="submit" value="Submit survey" />

</form>
</div>


<% /*

Thanks!  Here's the survey page text for the UW-only registrants:

==

We would like you to answer this short survey about yourself so we can understand our audience and your experience.  The demographic questions are included so that we can compare participants in Kitizen Science with other citizen science projects.  Specifically, we are interested in knowing whether the demographics of Kitizen Science are similar, or different, from other projects.

Do you currently have a cat/cats in your care? [Checkboxes, can select multiple: Yes, a pet cat/cats; Yes, I care for feral/free-roaming cats, No]

Have you ever participated in an online citizen science project doing image identification or classification? [Drop-down: Yes; No]

Have you ever volunteered to do image identification or classification as part of research that is NOT online citizen science, such as viewing camera trap images for UW wildlife researchers? [Drop-down: Yes; No]

What is your current standing in school? [Dropdown: Freshman; Sophomore; Junior; Senior; Master's Student; Doctoral Student]

*/ %>

<% }
if (mode == 3) {
%>
<div id="instructions">

<h2>Instructions</h2>

<p>The first of our three validation tests is about determining how good humans are at identifying cats from photos by making matches between one cat photo and a library of cat photos.  Similar tests have been conducted on many types of animals since it's important for researchers to understand and plan for human error rates. </p>
<p>This study is running from July 29 to September 29, 2019.  You can join at any time during that period.  You can complete all 24 matching trials, or only a few – either way, we value your time and energy and Kitizen Science always aims to make participation flexible.  We estimate each matching trial will each take less than an hour to complete. You can complete a maximum of 2 matching trials per day.  Previous studies of photo identification in animals have suggested that observer fatigue can cause people to become less successful when they have been staring at photos for extended periods of time. </p>
<p><strong>Enrollment process </strong></p>
<p>This study asks you to consent to participate as a research volunteer, register for the website, and answer some demographic questions.  We don't need to know your name, but you will need to register for the website with an email address. </p>
<p><strong>Rules </strong></p>
<p>We ask that you create only one login for Kitizen Science, and each login only has one person using it.  We are looking at how participant demographics might change ability to identify cats in photos, so we need one set of demographic information to be tied to one user account.  We also ask that you don't ask friends for help during your participation – we want to see how successful you are while working on your own. </p>
<p><strong>Trial instructions </strong></p>
<p>After logging in, you will be presented with matching trials.  Click to start a trial.  Once you complete a trial, you won't be presented with the same one again.   </p>
<p>Once you start a trial, you will have a &quot;Cat to Match&quot; photo on the left side of the screen and a &quot;Cat Library&quot; on the right side, with the options to click &quot;yes&quot; or &quot;no&quot; and zoom on either photo.   </p>
<p>During each individual trial, the Cat to Match photo will stay the same as you click through all of the Cat Library photos, and there may be one, multiple, or no matching cats in the library.  There is no &quot;I'm unsure&quot;  because we want you to make your best guess.  After clicking through all images in the Cat Library, the trial is complete, and you may do another trial or log off.  The Cat Library is the same in all trials and contains over 100 photos. </p>
<p>Most photos are taken at a distance, so make sure to click photos to zoom all the way in.  (Clicking on an image zooms in on it, and you are zoomed in all the way once clicking no longer increases the image size.)  These test photos were obtained in the same way that our project will gather data in the real world: by taking photos of free-roaming cats as they are seen walking through a neighborhood while not trespassing on private property.  That means some cats are harder to see than others, and you won't always get to see good details.</p>
<p><strong>How to compare similar cats </strong></p>
<p>Even two similar-looking cats can be separated if you examine them closely.  Here are some details to look for when comparing two cats.</p>
<table width="100%" border="0" align="center" cellpadding="10" cellspacing="0">
  <tr>
    <td valign="top"><div align="center">Does the cat have her ear tip removed, a marker that she has been sterilized?  These can be hard to see at a distance, or in cats that had a small amount of their ear tip removed.</div></td>
    <td valign="top"><div align="center">Is the cat wearing a collar?  Keep in mind that collars can be added or removed, unlike fur coat patterns.</div></td>
  </tr>
  <tr>
    <td><div align="center"><img src="images/whattolookfor_eartip.jpg" width="287" height="250" /></div></td>
    <td><div align="center"><img src="images/whattolookfor_collar.jpg" width="287" height="250" /></div></td>
  </tr>
  <tr>
    <td height="50">&nbsp;</td>
    <td height="50">&nbsp;</td>
  </tr>
  <tr>
    <td valign="top"><div align="center">Faces provide a lot of clues.  Does the cat have a strong &quot;M&quot; pattern on his forehead?  What position and color are the stripes on his cheeks?  Is there a stripe on his nose?</div></td>
    <td valign="top"><div align="center">Tabby cats can look the same at first glance, but the arrangement of their stripes is different.  Some have wider or thinner stripes, darker or lighter stripes, running across the cat at different angles. </div></td>
  </tr>
  <tr>
    <td><div align="center"><img src="images/whattolookfor_face.jpg" width="287" height="250" /></div></td>
    <td><div align="center"><img src="images/whattolookfor_flanks.jpg" width="287" height="250" /></div></td>
  </tr>
  <tr>
    <td height="50">&nbsp;</td>
    <td height="50">&nbsp;</td>
  </tr>
  <tr>
    <td valign="top"><div align="center">Look at her legs.  Does the cat have white mittens/boots?  Does she have darkly-colored stripes or pale stripes?  If you're looking at photos of a left and right side of a cat, is a distinctive mark on the same side of the cat's body?</div></td>
    <td valign="top"><div align="center">Along with color patterns and stripes, tails can be different, and some cats have shorter or kinked tails.</div></td>
  </tr>
  <tr>
    <td><div align="center"><img src="images/whattolookfor_frontlegs.jpg" width="287" height="250" /></div></td>
    <td><div align="center"><img src="images/whattolookfor_tail.jpg" width="238" height="250" /></div></td>
  </tr>
  <tr>
    <td height="50">&nbsp;</td>
    <td height="50">&nbsp;</td>
  </tr>
  <tr>
    <td valign="top"><div align="center">How long and thick is the cat's fur?  Does she have a big fluffy coat or a short coat?</div></td>
    <td valign="top"><div align="center">Remember that not every cat photo is going to be a great one, and sometimes you won't have the best view.  Try to do your best with the angle you have. </div></td>
  </tr>
  <tr>
    <td><div align="center"><img src="images/whattolookfor_longfur.jpg" width="307" height="250" /></div></td>
    <td><div align="center"><img src="images/whattolookfor_backside.jpg" width="213" height="250" /></div></td>
  </tr>
</table>
<p>&nbsp;</p>
<p><strong>That's everything!   </strong></p>
<p>We hope this is a fun and straightforward study.  If you have any questions, please email kitizenscience@gmail.com.</p>
<p>&nbsp;</p>


<% if (!instrOnly) {
        if (loggedIn) {
%>

<p align="center"><strong><a href="compare.jsp">Proceed to Study</strong></p>

<%      } else { //is logged in %>

<p align="center"><strong><a href="compare.jsp">Login to Proceed to Study</strong></p>

<%      } %>

</div>

<% }

} %>
            </div>
            
          <jsp:include page="footer.jsp" flush="true"/>
