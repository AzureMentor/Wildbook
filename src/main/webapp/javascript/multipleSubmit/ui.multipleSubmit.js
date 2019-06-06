/*

These functions create the many HTML components in the page. Many are nested together. 
There are listed in decending as much at that is applicable, ie imageTile contains an imageDataOverlay which contains 
an encNumDropdown ect.

*/


multipleSubmitUI = {

    getImageIdForIndex: function(index) {
        return "img-"+String(index);
    },
    
    getImageUIIdForIndex: function(index) {
        return "img-input-"+String(index);
    },

    getEncInputClassForIndex: function(index) {
        return "enc-input-"+String(index);
    },

    generateMetadataTile: function(index) {
        
        var metadataTile = "";
        metadataTile += "<div class=\"encounter-tile-div col-xs-12 col-xl-12\">";
        metadataTile += "   <div class=\"row\">";
        metadataTile += "       <div class=\"col-xs-12 col-md-5 col-lg-5 col-xl-5\">";
        metadataTile += "           <label id=\"encounter-label-"+index+"\" class=\"encounter-label\">&nbsp"+txt("encounterMetadata")+" #"+(index+1)+"&nbsp</label>";
        metadataTile += "           <input class=\"show-metadata-btn\" type=\"button\" onclick=\"showEditMetadata("+index+")\" value=\""+txt("showDetails")+"\" />";
        metadataTile += "       </div>";
        metadataTile += "       <div class=\"col-xs-12 col-md-7 col-lg-7 col-xl-7\">";
        metadataTile +=             multipleSubmitUI.generateMetadataTileSummary(index); 
        metadataTile += "       </div>";
        metadataTile += "   </div>";
        metadataTile +=	"   <div id=\"enc-metadata-inner-"+index+"\" class=\"edit-closed\">";	
        metadataTile +=         "<div class=\"col-xs-12 col-md-4 col-lg-4 col-xl-4 enc-top-input\">"+multipleSubmitUI.generateLocationDropdown(index)+"</div>";
        metadataTile +=	"	     <div class=\"col-xs-12 col-md-4 col-lg-4 col-xl-4 enc-top-input\">";
        metadataTile += "           <p class=\"enc-input-label\"><small>Select Date:</small></p>";
        metadataTile += "           <input id=\"enc-date-"+index+"\" name=\"encDate\" title=\""+txt("encounterMetadata")+"\" type=\"text\" placeholder=\""+txt("enterDate")+"\" onchange=\"updateSummary("+index+")\" class=\"form-control encDate\" size=\"36\" />";
        metadataTile += "       </div>";
        metadataTile += "       <div class=\"col-xs-12 col-md-4 col-lg-4 col-xl-4 enc-top-input\">"+multipleSubmitUI.generateSpeciesDropdown(index)+"</div>";
        metadataTile +=	"       <p><textarea id=\"enc-comments-"+index+"\" class=\"form-control comment-box\" placeholder=\""+txt("moreInfo")+"\" onchange=\"updateSummary("+index+")\" rows=\"3\" cols=\"36\" /></p>";
        metadataTile +=             "<div id=\"image-list-target-"+index+"\">";
        metadataTile +=	"           </div>";
        metadataTile +=	"   </div>";
        metadataTile += "</div>";
        return metadataTile;
    }, 

    generateMetadataTileSummary: function(i) {
        // a series of small labels on the enc data dropdown to show you what you have entered onchange
        var summary = "";
        summary += "<label id=\"no-details-"+i+"\">"+txt("noDetails")+"</label>";
        summary += "<p>";
        summary += "    <label id=\"summary-date-"+i+"\" class=\"summary-label hidden-input\"> &nbsp<b>"+txt("date")+"</b> <span class=\"it-value\"></span> &nbsp </label>";
        summary += "    <label id=\"summary-location-"+i+"\" class=\"summary-label hidden-input\"> &nbsp<b>"+txt("location")+"</b> <span class=\"it-value\"></span> &nbsp </label>";
        summary += "    <label id=\"summary-species-"+i+"\" class=\"summary-label hidden-input\"> &nbsp<b>"+txt("species")+"</b> <span class=\"it-value\"></span> &nbsp </label>";
        summary += "    <label id=\"summary-comments-"+i+"\" class=\"summary-label hidden-input\"> &nbsp<b>"+txt("comments")+"</b> <span class=\"it-value\"></span> &nbsp </label>";
        summary += "</p>";
        return summary;
    },

    generateAssociatedImageList: function() {
        for (let i=0;i<this.encsDefined();i++) {
            let numImgs = numImagesForEnc(i);
            let imgNames = getEncImageList(i);        
            let lst = "";
            if (numImgs>0) {
                lst += "<div class=\"row\">";
                lst += "    <div class=\"filename-scroll-list col-xs-12 col-md-6 col-lg-6 col-xl-6\">";
                lst += "        <p><small>"+txt("hoverPreview")+"</small></p>";
                lst += "        <ul id=\"enc-image-list="+i+"\" class=\"enc-image-list\">";
                for (let j=0;j<numImgs;j++) {
                    let name = imgNames[j];
                    lst += "        <li class=\"hover-grey\" onmouseover=\"multipleSubmitUI.generateImageThumbnail('"+name+"',"+i+")\">"+name+"</li>";
                }
                lst += "        </ul>";
                lst += "    </div>"; 
                lst += "    <div id=\"image-preview-div-"+i+"\" class=\"image-preview-div col-xs-12 col-md-6 col-lg-6 col-xl-6\">";
                lst += "        <img id=\"image-preview-"+i+"\" class=\"image-preview\" />";
                // ADDING THE LABEL FOR THE IMAGE!!!!!!!!!!!!!
                lst += "        <label id=\"image-preview-label-"+i+"\" class=\"image-preview-label gallery-text\"></label>";
                lst += "    </div>"; 
                lst += "</div>"; // end row
            }
            document.getElementById("image-list-target-"+i).innerHTML = lst;

            // start with first one highlighted, bail if another is
            if (numImgs>0&&!document.getElementById("image-preview-"+i).classList.contains("user-selected")) {
                generateImageThumbnail(imgNames[0],i);
            }
        }
    },

    generateImageThumbnail: function(fileName, index) {
        let file = getFileFromFilename(fileName);
        if (this.hasVal(String(file))) {
            document.getElementById("image-preview-label-"+index).innerText = fileName;
            var reader = new FileReader();
            reader.onload = function(e) {
                $("#image-preview-"+index).attr('src', e.target.result);
                console.log("Here's what i'm trying to get: image-preview-"+index);
                if (document.getElementById("image-preview-"+index).classList.contains("user-selected")) {
                    document.getElementById("image-preview-"+index).classList.add("user-selected");    
                }
            }
            reader.readAsDataURL(file);
        }
    },

    //clearImageThumbnail: function(index) {
    //    document.getElementById("image-preview-"+index).setAttribute("src", "");
    //},

    refreshAssociatedImageList: function() {
        for (let i=0;i<this.encsDefined();i++) {
            let encList = document.getElementById("image-list-target-"+i);
            encList.innerHTML = "";
        }
        this.generateAssociatedImageList();
    },

    generateImageTile: function(file, index) {
        var imageTile = "";
        imageTile += "<div id=\"image-tile-div-"+index+"\" class=\"image-tile-div col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-3\" onmouseover=\"showOverlay("+index+")\" onmouseout=\"hideOverlay("+index+")\" >";
        imageTile += "  <img class=\"image-element\" id=\""+multipleSubmitUI.getImageIdForIndex(index)+"\" src=\"../../images/loading.png\" alt=\"Displaying "+file.name+"\" />";
        imageTile += "  <input class=\"form-control img-filename img-filename-"+index+"\" type=\"hidden\" value=\""+file.name+"\" />";
        imageTile +=    multipleSubmitUI.generateImageDataOverlay(file,index);                
        imageTile += "</div>";
        //console.log("image tile: "+imageTile);
        return imageTile;
    },

    generateImageDataOverlay: function(file,index) {
        var uiClass = multipleSubmitUI.getImageUIIdForIndex(index);
        var overlay = "";
        overlay += "  <div hidden id=\"img-overlay-"+index+"\" class=\"img-overlay-"+index+" img-input "+uiClass+"\" >";
        overlay += "      <label class=\""+uiClass+" img-input-label\">"+txt("file")+"  "+file.name+"</label>";
        overlay += multipleSubmitUI.generateEncNumDropdown(index);
        overlay += "  </div>";
        return overlay;                   
    },
    
    generateEncNumDropdown: function(index) { 
        var uiClass = multipleSubmitUI.getImageUIIdForIndex(index);
        var encDrop = "";
        encDrop += "<p class=\"img-input-label\"><small>"+txt("selectEncounter")+"</small></p>";
        encDrop += "<select id=\"enc-num-dropdown-"+index+"\" class=\"form-control "+uiClass+" enc-num-dropdown\" onclick=\"preventDefaultAndPropagation(event)\" onchange=\"highlightOnEdit("+index+")\" name=\"enc-num-dropdown-"+index+"\">";
        encDrop += "    <option selected=\"selected\" value=\"unassigned\">"+txt("unassigned")+"</option>";
        encDrop += "    <option value=\"0\">"+txt("encounter")+"  #1</option>";
        for (var i=1;i<multipleSubmitUI.encsDefined();i++) {
            encDrop += "<option value=\""+i+"\">"+txt("encounter")+" #"+(i+1)+"</option>";
        }
        encDrop += "<option value=\"ignored\">"+txt("ignoreImage")+"</option>";
        encDrop += "</select>";
        return encDrop;
    },

    generateSpeciesDropdown: function(index) { 
        var uiClass = multipleSubmitUI.getEncInputClassForIndex(index);
        var speciesDrop = "";
        var uiId = "spec-" + uiClass;
        speciesDrop += "<p class=\"enc-input-label\"><small>"+txt("selectSpecies")+":</small></p>";
        speciesDrop += "<select id=\""+uiId+"\" class=\"form-control "+uiClass+"\" onchange=\"updateSummary("+index+")\" name=\"species-dropdown-"+index+"\">";
        multipleSubmitAPI.getSpecies(function(result){
            var allSpecies = result.allSpecies
            for (var i=0;i<allSpecies.length;i++) {
                var species = allSpecies[i];
                //console.log("allSpecies? --> "+JSON.stringify(result));
                var option = document.createElement("option");
                option.text = species; 
                option.value = species;
                //console.log("Appending child for species="+species);
                if (document.getElementById(uiId)!=null) {
                    document.getElementById(uiId).appendChild(option);
                }
            }
        });
        speciesDrop += "</select>";
        return speciesDrop;
    },

    generateLocationDropdown: function(index) {
        var uiClass = multipleSubmitUI.getEncInputClassForIndex(index);
        var uiId = "loc-" + uiClass;
        var dd = "";
        dd += "<p class=\"enc-input-label\"><small>"+txt("selectLocation")+"</small></p>";
        dd += "<select id=\""+uiId+"\" class=\"form-control "+uiClass+"\" onchange=\"updateSummary("+index+")\" name=\"enc-num-dropdown-"+index+"\">";
        dd += "    <option selected=\"selected\" value=\"null\" disabled>"+txt("chooseLocation")+"</option>";
        multipleSubmitAPI.getLocations(function(locObj){
            var ddLocs = ""; 
            if (locObj.hasOwnProperty('locationIds')) {
                var locs = locObj.locationIds;
                //console.log("Type? "+(typeof locs));
                //console.log("----------------> locs: "+JSON.stringify(locs));
                for (var i in locs) {
                    var option = document.createElement("option");
                    option.text = locs[i];
                    option.value = locs[i];
                    if (document.getElementById(uiId)!=null) {
                        document.getElementById(uiId).appendChild(option);
                    } else {
                        ddLocs += "<option value=\""+locs[i]+"\">"+locs[i]+"</option>";
                    }
                }  
            }
        });
        dd += "</select>";
        return dd;
    },
    
    generateWaitingText: function() {
        var wait = "";
        wait += "<div class=\"container waiting-div pulsing\">";
        wait += "     <p class=\"results-waiting\">Please wait for results. This may take a few seconds per image.</p>";
        wait += "</div>"; 
        return wait;
    },

    generateResultPage: function(result) {
        var re = "";
        re += "<div class=\"container\">";
        re += "<h3>"+txt("resultsHeader")+"</h3>";
        console.log("Generating result page!  :  "+JSON.stringify(result));
        for (var i=0;i<result.numEncs; i++) {
            re += "<div class=\"row\">";
            var genSpec = result[i].genSpec;
            var location = result[i].location;
            var date = result[i].date;
            re += "<div class=\"col-xs-6 col-xl-6\">";
            re += "<p><a target=\"_blank\" href=\"//"+baseURL()+"/encounters/encounter.jsp?number="+result[i].id+"\">"+txt("encounter")+" #"+(i+1)+": "+result[i].id+"</a></p>";
            if (result[i]["img-names"].length>0) {
                re += "    <p><small>"+txt("imageList")+"</small></p>";
                re += "    <ul>";
                for (var j=0;j<result[i]["img-names"].length;j++) {
                    re += "    <li><small>"+result[i]["img-names"][j]+"</small></li>";
                }
                re += "    </ul>";
            }
            re += "</div>";
            re += "<div class=\"col-xs-6 col-xl-6\">";
            re += "<br><br>"; // trust me
            if (this.hasVal(date)) {re += "<p><small>"+txt("date")+" "+date+"</small></p>";}
            if (this.hasVal(location)) {re += "<p><small>"+txt("location")+" "+location+"</small></p>";}
            if (this.hasVal(genSpec)) {re += "    <p><small>"+txt("species")+" "+genSpec+"</small></p>";}
            re += "</div>";
            re += "<br>";
            re += "</div>";
        }
        re += "    <hr>";
        re +=      "<div class=\"row\">";
        re +=      "    <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12\">";
        re +=      "    <a target=\"_blank\" href=\"//"+baseURL()+"\"><h4>"+txt("goHome")+"</h4></a>";
        re +=      "    <a target=\"_blank\" href=\"//"+baseURL()+"/multipleSubmit/multipleSubmit.jsp\"><h4>"+txt("submitAgain")+"</h4></a>";
        re +=      "    </div>";
        re +=      "</div>";
        re += "    </div>";
        re += "</div>";
        return re;
    },

    generateGalleryComponent: function(numEncs) {
        var hdr = "";
        hdr += "<div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12\">";
        hdr += "    <h3 class=\"gallery-text\">"+txt("galleryHeader")+"</h3>";
        hdr += "    <p class=\"gallery-text\">"+txt("galleryLabel")+"</p>";
        hdr += "</div>";
        hdr += "<div class=\"gallery-text col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12\">";
        hdr += "    <input id=\"hide-all-enc-images-btn\" class=\"show-selected-images-btn\" type=\"button\" onclick=\"toggleAllCuratedEncImages(false)\" value=\""+txt("hideAllCurated")+"\" data-toggle=\"tooltip\" title=\""+txt("ttHideAllImages")+"\" />"; 
        hdr += "    <input id=\"show-all-enc-images-btn\" class=\"show-selected-images-btn\" type=\"button\" onclick=\"toggleAllCuratedEncImages(true)\" value=\""+txt("showAllCurated")+"\" data-toggle=\"tooltip\" title=\""+txt("ttShowAllImages")+"\" />"; 

        for (let i=0;i<numEncs;i++) {
            let hideText = txt("dismiss")+" "+numImagesForEnc(i)+" "+txt("imgForEnc")+" #"+(i+1);
            let showText = txt("show")+" "+numImagesForEnc(i)+" "+txt("imgForEnc")+" #"+(i+1);
            hdr += "    <input id=\"hide-enc-images-btn-"+i+"\" class=\"hover-light-text show-selected-images-btn\" type=\"button\" onclick=\"toggleEncImages("+i+")\" value=\""+hideText+"\"  data-toggle=\"tooltip\" title=\""+txt("ttHideImages")+"\" />";
            hdr += "    <input id=\"show-enc-images-btn-"+i+"\" class=\"hover-light-text show-selected-images-btn hidden-input\" type=\"button\" onclick=\"toggleEncImages("+i+")\" value=\""+showText+"\" data-toggle=\"tooltip\" title=\""+txt("ttShowImages")+"\" />";  
        }
        hdr += "</div>";
        return hdr;
    },

    updateFileCounters: function() {
        console.log("ENCS DEFINED?  "+this.encsDefined());
        for (let i=0;i<this.encsDefined();i++) {
            let numImages = numImagesForEnc(i);
            let imgOrImages = txt("imgForEnc");
            let showBtn = document.getElementById("show-enc-images-btn-"+i);
            let hideBtn = document.getElementById("hide-enc-images-btn-"+i);
            // inherit color from the enc metadata elements
            let bgColor = document.getElementById("encounter-label-"+String(i)).style.backgroundColor;
            showBtn.style.backgroundColor = bgColor;
            hideBtn.style.backgroundColor = bgColor;

            if (numImages>=1) {
                console.log("numImages is >1 !");
                showBtn.style.setProperty("color", "black");
                hideBtn.style.setProperty("color", "black");
                showBtn.disabled = "";
                hideBtn.disabled = "";
                if (numImages>1) {
                    imgOrImages = txt("imgsForEnc");
                }
            } else {
                imgOrImages = txt("addImages");
                console.log("numImages is 0.. still disabled.");
                showBtn.style.setProperty("color", "grey");
                hideBtn.style.setProperty("color", "grey");
                showBtn.disabled = "true";
                hideBtn.disabled = "true";
            }
            
            if (showBtn!=null&&hideBtn!=null) {
                showBtn.value = txt("show")+" "+numImages+" "+imgOrImages+" #"+(i+1);
                hideBtn.value = txt("hide")+" "+numImages+" "+imgOrImages+" #"+(i+1);
            }
        }
    },
    
    renderImageInBrowser: function(file,id) {
        if (this.hasVal(String(file))) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $('#'+multipleSubmitUI.getImageIdForIndex(id)).attr('src', e.target.result); // This is the target.. where we want the preview
            }
            reader.readAsDataURL(file);
        }
    },

    addEncounterLabel: function(imgEl, selectedEnc) {
        this.removeEncounterLabel(imgEl);

        let lbl;
        let labelColor;
        if (selectedEnc=="ignored") {
            lbl = "Ignored";
            labelColor = "#B6B6B6"; // a noice medium grey
        } else {
            lbl = "Encounter #"+(parseInt(selectedEnc)+1);
            labelColor = safeColors[selectedEnc];
        }

        let dv = document.createElement("DIV");
        let txt = document.createTextNode(lbl);
        dv.classList.add("chosen-enc-label");

        // calculate dimensions without the border if present
        let borderWidth = getComputedStyle(imgEl,null).getPropertyValue("border-width");
        if (isNaN(borderWidth)) {borderWidth=0;}
        let borderHeight = getComputedStyle(imgEl,null).getPropertyValue("border-height");
        if (isNaN(borderHeight)) {borderHeight=0;}

        let imgWidth = imgEl.clientWidth - borderWidth;
        let imgHeight = imgEl.clientHeight - borderHeight;

        let tileHeight = imgEl.parentNode.clientHeight;
        let tileWidth = imgEl.parentNode.clientWidth;

        dv.style.setProperty("background-color", labelColor, "important");
        dv.style.setProperty("margin-top", (tileHeight-imgHeight)/2, "important");
        dv.style.setProperty("margin-left",(((tileWidth-imgWidth)/2)+7), "important");
        
        dv.appendChild(txt);

        imgEl.parentNode.appendChild(dv);
   
        imgEl.style.setProperty("border", labelColor, "important");
        imgEl.style.setProperty("border-style", "solid", "important");
        imgEl.style.setProperty("border-width", "6px", "important" );
        imgEl.style.setProperty("max-width", "96%", "important" );
    },
 
    removeEncounterLabel: function(imgEl) { 
        //console.log("removing label...");
        if (imgEl.parentNode.getElementsByClassName("chosen-enc-label")!=undefined&&imgEl.parentNode.getElementsByClassName("chosen-enc-label").length>0) {
            let lbl = imgEl.parentNode.getElementsByClassName("chosen-enc-label");
            for (let i=0;i<lbl.length;i++) {
                lbl[i].removeChild(lbl[i].firstChild);
                imgEl.parentNode.removeChild(lbl[i]);
            }
        }
        imgEl.style.setProperty("border", "darkblue", "important");
        imgEl.style.setProperty("border-style", "none", "important");
        imgEl.style.setProperty("border-width", "3px", "important");
        imgEl.style.setProperty("max-width", "98%", "important");
    },
    
    hasVal: function(entry) {
        if (entry==undefined||entry==""||!entry||entry==null||entry=="null") return false;
        return true; 
    }, 

    encsDefined() {
        return document.getElementById('number-encounters').value;
    }

};