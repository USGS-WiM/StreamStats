﻿//------------------------------------------------------------------------------
//----- Wateruse Bar Chart ------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2016 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  
//          
//discussion:
//  http://www.ng-newsletter.com/posts/directives.html
//      Restrict parameters
//          'A' - <span ng-sparkline></span>
//          'E' - <ng-sparkline > </ng-sparkline>
//          'C' - <span class="ng-sparkline" > </span>
//          'M' - <!--directive: ng - sparkline-- >

//Comments
//01.11.2016 jkn - Created

//Import
module WiM.Directives {
    'use strict';

    class WateruseBarChart implements ng.IDirective {
        static instance(): ng.IDirective {
            return new WateruseBarChart;
        }
        //create isolated scope
        scope = {
            data: '=',            
        }
        restrict = 'E';

        link(scope: ng.IScope, element: ng.IAugmentedJQuery): void {
            //this is where we can register listeners, set up watches, and add functionality. 
            // The result of this process is why the live data- binding exists between the scope and the DOM tree.
            //Set margins, width, and height

            var margin = { top: 20, right: 20, bottom: 30, left: 40 },
                width = 480 - margin.left - margin.right,
                height = 360 - margin.top - margin.bottom;
          
            //Create the d3 element and position it based on margins
            var svg = d3.select(element[0])
                .append("svg")
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            //Create the scales we need for the graph
            var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
            var y = d3.scale.linear().range([height, 0]);

            //Create the axes we need for the graph
            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .ticks(10);

            //Render graph based on 'data'
            (<any>scope).render = function (data) {
                //Set our scale's domains
                x.domain(data.map(function (d) { return d.name; }));
                y.domain([0, d3.max(data, function (d) { return d.count; })]);
          
                //Redraw the axes
                svg.selectAll('g.axis').remove();
                //X axis
                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);
              
                //Y axis
                svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis)
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text("Count");

                var bars = svg.selectAll(".bar").data(data);
                bars.enter()
                    .append("rect")
                    .attr("class", "bar")
                    .attr("x", function (d) { return x(d.name); })
                    .attr("width", x.rangeBand());

                //Animate bars
                bars
                    .transition()
                    .duration(1000)
                    .attr('height', function (d) { return height - y(d.count); })
                    .attr("y", function (d) { return y(d.count); })
            };




            //Watch 'data' and run scope.render(newVal) whenever it changes
            //Use true for 'objectEquality' property so comparisons are done on equality and not reference
            scope.$watch('data', function () {
                (<any>scope).render((<any>scope).data);
            }, true);
        
            element.bind('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
            });

            element.bind('mouseover', (e) => {
                    
            });
            element.bind('mouseout', (e) => {
             
            });


        }//end link

    }//end UrlDirective

    angular.module('StreamStats')
        .directive('wuBarChart', WateruseBarChart.instance);
}//end module 