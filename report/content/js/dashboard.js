/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 11.8658249030197, "KoPercent": 88.1341750969803};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.0410535470828828, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.05981941309255079, 500, 1500, "Login User"], "isController": false}, {"data": [0.026352288488210817, 500, 1500, "GET Contact"], "isController": false}, {"data": [0.0527249274427604, 500, 1500, "DELETE Contact list"], "isController": false}, {"data": [0.051757497581425345, 500, 1500, "PATCH Contact list"], "isController": false}, {"data": [0.06320541760722348, 500, 1500, "Add New Contact"], "isController": false}, {"data": [0.0, 500, 1500, "GET Contact lists"], "isController": false}, {"data": [0.05949693647210577, 500, 1500, "PUT Contact list"], "isController": false}, {"data": [0.0, 500, 1500, "Transaction Contact Controller"], "isController": true}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 39441, 34761, 88.1341750969803, 1156.4185999340853, 0, 82438, 728.0, 1770.9000000000015, 3237.7000000000044, 30000.00000000016, 29.921072276068, 477.41613280349134, 9.770258265164228], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Login User", 3101, 2649, 85.4240567558852, 4297.290873911637, 0, 43724, 1596.0, 15487.000000000025, 28798.499999999913, 30259.0, 2.3654944463133454, 2.691296121325226, 0.636506433691018], "isController": false}, {"data": ["GET Contact", 5768, 5334, 92.47572815533981, 754.2052704576961, 0, 59989, 519.0, 1450.0, 1927.1000000000004, 3836.8600000000024, 4.40943196455942, 5.066056313331116, 1.0125871489673994], "isController": false}, {"data": ["DELETE Contact list", 6202, 5378, 86.71396323766527, 849.4914543695575, 0, 59707, 543.5, 1406.3999999999996, 2192.5499999999984, 5257.510000000021, 4.734517395267315, 5.402488727657612, 1.3435027167461606], "isController": false}, {"data": ["PATCH Contact list", 6202, 5369, 86.56884875846501, 835.07481457594, 0, 31002, 533.0, 1428.0999999999995, 2382.649999999995, 5299.040000000008, 4.738398677954681, 5.444627235497344, 1.3308019049287139], "isController": false}, {"data": ["Add New Contact", 6202, 5344, 86.16575298290874, 792.7002579812969, 0, 49334, 535.0, 1365.0, 1866.9499999999962, 4797.140000000016, 4.7306099908774435, 5.647416104754179, 2.1887166547104733], "isController": false}, {"data": ["GET Contact lists", 5764, 5326, 92.40111034004164, 1303.3148854961848, 0, 82438, 745.0, 2187.0, 5312.75, 11290.000000000124, 4.39416347751841, 450.16133970313285, 0.9439766669652523], "isController": false}, {"data": ["PUT Contact list", 6202, 5361, 86.439858110287, 815.517091260883, 0, 56331, 530.0, 1322.0, 1884.8499999999995, 4468.670000000079, 4.738395057766858, 5.392120461632523, 2.376325063346046], "isController": false}, {"data": ["Transaction Contact Controller", 3101, 2700, 87.06868752015478, 6397.945178974544, 1817, 74793, 5171.0, 8353.6, 10713.39999999999, 43758.24000000001, 2.3678353128925234, 15.504938070769718, 4.461546209678651], "isController": true}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["503/Service Unavailable", 3983, 11.458243433733207, 10.098628330924672], "isController": false}, {"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: No such host is known (thinking-tester-contact-list.herokuapp.com)", 1, 0.0028767872040505165, 0.002535432671585406], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 3911, 11.25111475504157, 9.916077178570523], "isController": false}, {"data": ["401/Unauthorized", 22087, 63.539598975863754, 56.000101417306865], "isController": false}, {"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com", 4698, 13.515146284629326, 11.911462691108238], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 81, 0.23301976352809184, 0.20537004639841788], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 39441, 34761, "401/Unauthorized", 22087, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com", 4698, "503/Service Unavailable", 3983, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 3911, "Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 81], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Login User", 3101, 2649, "401/Unauthorized", 1491, "503/Service Unavailable", 528, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com", 353, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 268, "Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 9], "isController": false}, {"data": ["GET Contact", 5768, 5334, "401/Unauthorized", 3474, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com", 714, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 605, "503/Service Unavailable", 534, "Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 6], "isController": false}, {"data": ["DELETE Contact list", 6202, 5378, "401/Unauthorized", 3463, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com", 733, "503/Service Unavailable", 618, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 554, "Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 10], "isController": false}, {"data": ["PATCH Contact list", 6202, 5369, "401/Unauthorized", 3463, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com", 731, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 610, "503/Service Unavailable", 553, "Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 12], "isController": false}, {"data": ["Add New Contact", 6202, 5344, "401/Unauthorized", 3243, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 806, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com", 742, "503/Service Unavailable", 540, "Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 13], "isController": false}, {"data": ["GET Contact lists", 5764, 5326, "401/Unauthorized", 3480, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com", 707, "503/Service Unavailable", 600, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 526, "Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 13], "isController": false}, {"data": ["PUT Contact list", 6202, 5361, "401/Unauthorized", 3473, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com", 718, "503/Service Unavailable", 610, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 542, "Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 18], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
