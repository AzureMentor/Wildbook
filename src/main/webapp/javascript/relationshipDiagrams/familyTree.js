// This tree was pared down from https://github.com/justincy/d3-pedigree-examples which has the capability of displaying multiple generations of ancestors (extending left) and descendants (extending right). This tree is optimized for the flukebook data which currently only holds mother/calf relationships.

var boxWidth = 150,
    boxHeight = 40,
    nodeWidth = 100,
    nodeHeight = 200,

    // duration of transitions in ms
    duration = 750,

    // d3 multiplies the node size by this value
    // to calculate the distance between nodes
    separation = .5;
/**
 * For the sake of the examples, I want the setup code to be at the top.
 * However, since it uses a class (Tree) which is defined later, I wrap
 * the setup code in a function at call it at the end of the example.
 * Normally you would extract the entire Tree class defintion into a
 * separate file and include it before this script tag.
 */
var children = [];
var parents = [];
var role;

function setupFamilyTree(individualID) {

  d3.json(wildbookGlobals.baseUrl + "/api/jdoql?"+encodeURIComponent("SELECT FROM org.ecocean.social.Relationship WHERE (this.type == \"Familial\") && (this.markedIndividualName1 == \"" + individualID + "\" || this.markedIndividualName2 == \"" + individualID + "\")"), function(error, json){

    if(error) {
      return console.error(error);
    }

    if(json.length < 1) {
      //If there are no familial relationships, show social relationships table instead
      $("#familyDiagram").hide();
      $("#communityTable").show();
      $("#familyDiagramTab").removeClass("active");
      $("#communityTableTab").addClass("active");
      showIncompleteInformationMessage();

    } else if(json.length >= 1) {
      // Setup zoom and pan
      var zoom = d3.behavior.zoom()
      .scaleExtent([.1,1])
      .on('zoom', function(){
        svg.attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
      })
      // Offset so that first pan and zoom does not jump back to the origin
      .translate([400, 200]);

      var svg = d3.select("#familyDiagram").append("svg")
      .attr('width', "100%")
      .attr('height', "300px")
      .call(zoom)
      .append('g')

      // Left padding of tree so that the whole root node is on the screen.
      // TODO: find a better way
      .attr("transform", "translate(300, 150)");


      // One tree to display the ancestors
      var ancestorTree = new Tree(svg, 'ancestor', -1);
      ancestorTree.children(function(individual){
        // If the individual is collapsed then tell d3
        // that they don't have any ancestors.
        if(individual.collapsed){
          return;
        } else {
          return individual._parents;
        }
      });

      // Use a separate tree to display the descendants
      var descendantsTree = new Tree(svg, 'descendant', 1);
      descendantsTree.children(function(individual){
        if(individual.collapsed){
          return;
        } else {
          return individual._children;
        }
      });
      // D3 modifies the objects by setting properties such as
      // coordinates, parent, and children. Thus the same node
      // node can't exist in two trees. But we need the root to
      // be in both so we create proxy nodes for the root only.
      findChildren(json, individualID);
      findParents(json, individualID);
      var ancestorRoot = rootProxy(json, individualID);
      var descendantRoot = rootProxy(json, individualID);

      // Start with only the first few generations of ancestors showing
      // ancestorRoot._parents.forEach(function(parents){
      //   parents._parents.forEach(collapse);
      // });

      // Start with only one generation of descendants showing
      //  descendantRoot._children.forEach(collapse)

      // Set the root nodes
      ancestorTree.data(ancestorRoot);
      descendantsTree.data(descendantRoot);

      // Draw the tree
      ancestorTree.draw(ancestorRoot);
      descendantsTree.draw(descendantRoot);
    }


  });
}

var showIncompleteInformationMessage = function() {
  $("#familyDiagram").html("<h4>There are currently no known familial relationships for this Marked Individual</h4>")
};


var findChildren = function(root, individualID) {
  for (var i = 0; i < root.length; i++) {
    if ((root[i].markedIndividualName1 == individualID) && (root[i].markedIndividualRole1 == "mother")){
      children.push({name: root[i].markedIndividualName2, role: root[i].markedIndividualRole2});
      role = root[i].markedIndividualRole1;
    } else if ((root[i].markedIndividualName2 == individualID) && (root[i].markedIndividualRole2 == "mother")){
      children.push({name: root[i].markedIndividualName1, role: root[i].markedIndividualRole1});
      role = root[i].markedIndividualRole2;
    }
  }
  return children;
};

var findParents = function(root, individualID) {
  for (var i = 0; i < root.length; i++) {
    if ((root[i].markedIndividualName1 == individualID) && (root[i].markedIndividualRole1 == "calf")){
      parents.push({name: root[i].markedIndividualName2, role: root[i].markedIndividualRole2});
      role = root[i].markedIndividualRole1;
    } else if ((root[i].markedIndividualName2 == individualID) && (root[i].markedIndividualRole2 == "calf")){
      parents.push({name: root[i].markedIndividualName1, role: root[i].markedIndividualRole1});
      role = root[i].markedIndividualRole2;
    }
  }
  return parents;
};

var rootProxy = function(root, individualID){
    return {
    name: individualID,
    id: individualID,
    x0: 0,
    y0: 0,
    _children: children,
    _parents: parents,
    collapsed: false,
    role: role
  };
}
/**
 * Shared code for drawing ancestors or descendants.
 * `selector` is a class that will be applied to links
 * and nodes so that they can be queried later when
 * the tree is redrawn.
 * `direction` is either 1 (forward) or -1 (backward).
 */
var Tree = function(svg, selector, direction){
  this.svg = svg;
  this.selector = selector;
  this.direction = direction;

  this.tree = d3.layout.tree()

      // Using nodeSize we are able to control
      // the separation between nodes. If we used
      // the size parameter instead then d3 would
      // calculate the separation dynamically to fill
      // the available space.
      .nodeSize([nodeWidth, nodeHeight])

      // By default, cousins are drawn further apart than siblings.
      // By returning the same value in all cases, we draw cousins
      // the same distance apart as siblings.
      .separation(function(){
        return separation;
      });
};

/**
 * Set the `children` function for the tree
 */
Tree.prototype.children = function(fn){
  this.tree.children(fn);
  return this;
};
/**
 * Set the root of the tree
 */
Tree.prototype.data = function(data){
  this.root = data;
  return this;
};

/**
 * Draw/redraw the tree
 */
Tree.prototype.draw = function(source){
  if(this.root){
    var nodes = this.tree.nodes(this.root),
        links = this.tree.links(nodes);
    this.drawLinks(links, source);
    this.drawNodes(nodes, source);
  } else {
    throw new Error('Missing root');
  }
  return this;
};
/**
 * Draw/redraw the connecting lines
 */
Tree.prototype.drawLinks = function(links, source){

  var self = this;

  // Update links
  var link = self.svg.selectAll("path.link." + self.selector)

      // The function we are passing provides d3 with an id
      // so that it can track when data is being added and removed.
      // This is not necessary if the tree will only be drawn once
      // as in the basic example.
      .data(links, function(d){ return d.target.id; });

  // Add new links
  // Transition new links from the source's
  // old position to the links final position
  link.enter().append("path")
      .attr("class", "link " + self.selector)
      .attr("d", function(d) {
        var o = {x: source.x0, y: self.direction * (source.y0 + boxWidth/2)};
        return transitionElbow({source: o, target: o});
      });

  // Update the old links positions
  link.transition()
      .duration(duration)
      .attr("d", function(d){
        return elbow(d, self.direction);
      });

  // Remove any links we don't need anymore
  // if part of the tree was collapsed
  // Transition exit links from their current position
  // to the source's new position
  link.exit()
      .transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: self.direction * (source.y + boxWidth/2)};
        return transitionElbow({source: o, target: o});
      })
      .remove();
};

/**
 * Draw/redraw the individual boxes.
 */
Tree.prototype.drawNodes = function(nodes, source){

  var self = this;

  // Update nodes
  var node = self.svg.selectAll("g.individual." + self.selector)

      // The function we are passing provides d3 with an id
      // so that it can track when data is being added and removed.
      // This is not necessary if the tree will only be drawn once
      // as in the basic example.
      .data(nodes, function(individual){ return individual.id; });

  // Add any new nodes
  var nodeEnter = node.enter().append("g")
      .attr("class", "individual " + self.selector)

      // Add new nodes at the right side of their child's box.
      // They will be transitioned into their proper position.
      .attr('transform', function(individual){
        return 'translate(' + (self.direction * (source.y0 + boxWidth/2)) + ',' + source.x0 + ')';
      })
      .on('click', function(individual){
        self.toggleIndividual(individual);
      });
  // Draw the rectangle individual boxes.
  // Start new boxes with 0 size so that
  // we can transition them to their proper size.
  nodeEnter.append("rect")
      .attr({
        x: 0,
        y: 0,
        width: 0,
        height: 0
      });
  // Draw the individual's name and position it inside the box
  //TODO: add role text
  nodeEnter.append("text")
      .attr("dx", 0)
      .attr("dy", 0)
      .attr("text-anchor", "start")
      .attr('class', 'name')
      .text(function(d) {
        return d.name + "   " + d.role;
      })
      .style('fill-opacity', 0);

  // Update the position of both old and new nodes
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + (self.direction * d.y) + "," + d.x + ")"; });

  // Grow boxes to their proper size
  nodeUpdate.select('rect')
      .attr({
        x: -(boxWidth/2),
        y: -(boxHeight/2),
        width: boxWidth,
        height: boxHeight
      });

  // Move text to it's proper position
  nodeUpdate.select('text')
      .attr("dx", -(boxWidth/2) + 10)
      .style('fill-opacity', 1);

  // Remove nodes we aren't showing anymore
  var nodeExit = node.exit()
      .transition()
      .duration(duration)

      // Transition exit nodes to the source's position
      .attr("transform", function(d) { return "translate(" + (self.direction * (source.y + boxWidth/2)) + "," + source.x + ")"; })
      .remove();

  // Shrink boxes as we remove them
  nodeExit.select('rect')
      .attr({
        x: 0,
        y: 0,
        width: 0,
        height: 0
      });

  // Fade out the text as we remove it
  nodeExit.select('text')
      .style('fill-opacity', 0)
      .attr('dx', 0);

  // Stash the old positions for transition.
  nodes.forEach(function(individual) {
    individual.x0 = individual.x;
    individual.y0 = individual.y;
  });

};
/**
 * Update a individual's state when they are clicked.
 */
Tree.prototype.toggleIndividual = function(individual){

  // Don't allow the root to be collapsed because that's
  // silly (it also makes our life easier)
  if(individual === this.root){
    return;
  }

  // Non-root nodes
  else {

    if(individual.collapsed){
      individual.collapsed = false;
    } else {
      collapse(individual);
    }

    this.draw(individual);
  }
};
/**
 * Collapse individual (hide their ancestors). We recursively
 * collapse the ancestors so that when the individual is
 * expanded it will only reveal one generation. If we don't
 * recursively collapse the ancestors then when
 * the individual is clicked on again to expand, all ancestors
 * that were previously showing will be shown again.
 * If you want that behavior then just remove the recursion
 * by removing the if block.
 */
function collapse(individual){
  individual.collapsed = true;
  if(individual._parents){
    individual._parents.forEach(collapse);
  }
  if(individual._children){
    individual._children.forEach(collapse);
  }
}

/**
 * Custom path function that creates straight connecting
 * lines. Calculate start and end position of links.
 * Instead of drawing to the center of the node,
 * draw to the border of the individual profile box.
 * That way drawing order doesn't matter. In other
 * words, if we draw to the center of the node
 * then we have to draw the links first and the
 * draw the boxes on top of them.
 */
function elbow(d, direction) {
  var sourceX = d.source.x,
      sourceY = d.source.y + (boxWidth / 2),
      targetX = d.target.x,
      targetY = d.target.y - (boxWidth / 2);

  return "M" + (direction * sourceY) + "," + sourceX
    + "H" + (direction * (sourceY + (targetY-sourceY)/2))
    + "V" + targetX
    + "H" + (direction * targetY);
}
/**
 * Use a different elbow function for enter
 * and exit nodes. This is necessary because
 * the function above assumes that the nodes
 * are stationary along the x axis.
 */
function transitionElbow(d){
  return "M" + d.source.y + "," + d.source.x
    + "H" + d.source.y
    + "V" + d.source.x
    + "H" + d.source.y;
}
