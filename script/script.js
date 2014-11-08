//Assignment 3
//Due Wednesday November 7 at 5:00PM

var margin = {t: 100, r: 100, b: 200, l: 150},
    width = $('.canvas').width() - margin.l - margin.r,
    height = $('.canvas').height() - margin.t - margin.b;


//Set up SVG drawing elements -- already done
var svg = d3.select('.canvas')
    .append('svg')
    .attr('width', width + margin.l + margin.r)
    .attr('height', height + margin.t + margin.b)
    .append('g')
    .attr('transform', 'translate(' + margin.l + ',' + margin.t + ')');

//Scales
var scales = {};
scales.x = d3.scale.log().range([0, width]);
scales.y = d3.scale.linear().range([height, 0]);


//Global variables
//TODO: use these variables in lieu of strings
var yVariable = "CO2 emissions (kt)",
    y0 = 1997,
    y1 = 2010;


//d3.map for metadata
var metaDataMap = d3.map();

//TODO: create a layout function for a treemap
var treemap = d3.layout.treemap()
    .children(function (d) { //specifies how to find the children
        return d.values;
    })
    .value(function (d) {
        return d.data.get(y0);
    })
    .size([width, height]) //to dynamically change treemap total size by total quantity
    .sticky(true)
    .padding(5, 5, 5, 5);


//START!
queue()
    .defer(d3.csv, "data/00fe9052-8118-4003-b5c3-ce49dd36eac1_Data.csv", parse)
    .defer(d3.csv, "data/metadata.csv", parseMetaData)
    .await(dataLoaded);

function dataLoaded(err, rows, metadata) {
    //TODO: consolidate data and meta data into the same object
    rows.forEach(function (row) {
        row.region = metaDataMap.get(row.key);
    })

    //Then create hierarchy based on regions
    var data = d3.nest()
        .key(function (d) {
            return d.region;
        })
        .entries(rows);

    var root = { //create a parent for all the country arrays
        key: "regions",
        values: data
    };


    //TODO: create a layout function using d3.layout.treemap() at the top of the program
    var treeMapData = treemap({
        key: "regions",
        values: data
    })
    console.log(data);

    //TODO: let's now layout the data

    draw(treeMapData);
}

function draw(root) {
    svg.selectAll('.node')
        .data(root)
        .enter()
        .append('rect')
        .attr('class', "node")
        .attr('transform', function (d) {
            return "translate(" + d.x + ',' + d.y + ')';
        })
        .attr('width', function (d) {
            return d.dx
        })
        .attr('height', function (d) {
            return d.dy
        })
        .style('fill', 'none')
        .style('stroke-width', "1px")
        .style('stroke', 'white');

    //var countries=
    //var countriesEnter=

    svg.selectAll("button").on("change", function (d) {
        treemap
            .data(treemap.value(y).nodes)
            .transition()
            .duration(1500)
    })
};

function parse(d) {
    var newRow = {
        key: d["Country Name"],
        series: d["Series Name"],
        data: d3.map()
    };
    for (var y = y0; y <= y1; y++) {
        var heading = y + " [YR" + y + "]";
        newRow.data.set(
            y,
            (d[heading] == "..") ? 0 : +d[heading]
        );
    }

    return newRow;
}

function parseMetaData(d) {
    //TODO: we would like to put metadata into a map structure
    var countryName = d["Table Name"];
    var region = d["Region"];
    metaDataMap.set(countryName, region);
    return d;
}
