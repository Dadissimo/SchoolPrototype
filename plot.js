const createSVG = (student, asPreview) => {
    const svg = d3.select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
    
    // set the dimensions and margins of the graph
    const margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 360 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const canvas = svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style('background-color', '#eeeeee')
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    const data = student.gradings.map((grade, i) => ({...grade, index: i}));

    // Add X axis
    const x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return d.index; }))
    .range([ 0, width ]);
    canvas.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x)
        .tickFormat(d => '')
    );

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, 100])
        .range([ height, 0 ]);

    canvas.append("g")
        .call(d3.axisLeft(y)
            .tickFormat(d => d + ' %')
        );

    // Add the lines
    canvas.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function(d) { return x(d.index) })
            .y(function(d) { return y(d.percentage) })
            );

    canvas.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function(d) { return x(d.index) })
            .y(function(d) { return y(d.assignmentGrade / 4 * 100) })
            );
    
    canvas.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function(d) { return x(d.index) })
            .y(function(d) { return y(d.difficulty / 4 * 100) })
            );

    const svgString = domNodeToString(svg.node());
    if (asPreview) d3.select('#preview').append('div').html(svgString);
    return svgString;
}

const domNodeToString = (domNode) => {
	var element = document.createElement('div');
    element.appendChild(domNode);
    // console.log(element.innerHTML);
	return element.innerHTML;
}