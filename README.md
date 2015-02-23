DataObject Parser
=================

[![Join the chat at https://gitter.im/Gigzolo/dataobject-parser](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/Gigzolo/dataobject-parser?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://travis-ci.org/Gigzolo/dataobject-parser.png?branch=master)](https://travis-ci.org/Gigzolo/dataobject-parser)

A nodejs module designed to parse an Object hash transposing between dot-notation and a structured heirarchy of Objects/Arrays.  


## TL;DR

String programming should be avoided.  

This module generally exists as a quick work around.  We original developed it to store our [MongoDb](http://www.mongodb.org/) documents in [Backbone.js](http://backbonejs.org/) models.  Our Backbonejs.model dispatched events from data in a complex hierarchal structure.  

Using this tool simplified our models so that we could just use one model with the subdocuments laid out in a hash with dot-notation.  In our application we've overwritten the Backbonejs.sync to parse the data before sending/receiving.  


## Installation

	$ npm install dataobject-parser

## Quick Start

Instantiate a new instance of DataObjectParser to manage an object:

	var d = new DataObjectParser();


Set using dot-notation:

	d.set("caravan.personel.leader","Travis");
	d.set("caravan.personel.cook","Brent");

Also set using array notation:

	d.set("location.rooms[0]", "kitchen");
	d.set("location.rooms[1]", "bathroom");

The Object returned should be the equivalent structured object:

	var obj = d.data();

That is, where ```obj``` is equivalent to:

	var obj = {
		caravan:{
			personel:{
				leader: "Travis",
				cook: "Brent"
			}
		},
		location: {
			rooms: ["kitchen", "bathroom"]
		}
	};

```transpose()``` and ```untranspose()``` methods can transform the data between the two formats (e.g. - An Object hash with properties using dot-notation and a heirchy structured Object or Object(s)/Arrays(s))

	flat = DataObjectParser.untranspose(structured)

	structured = DataObjectParser.transpose(flat)

Where the equivalent results would be:

	var structured = {
		location: {
			city:{
				name: "House on cliff",
				geo: '45, 23'
			}
		},
		time: {
			hour: '0',
			minute: '0'
		},
		duration: '4 hours',
		record: 'Beetles'
	};

	var flat = {
		'location.city.name': 'House on cliff',
		'location.city.geo': '45, 23',
		'time.hour': '0',
		'time.minute': '0',
		duration: '4 hours',
		record: 'Beetles'
	};

Please take a look at the test: ```test/utils-dataobject-parser.js``` for more code examples.  

## Contributors

* [Andrew Baez](https://github.com/fitz66)
* [Joanne Daudier](https://github.com/jdaudier)
* [Henry Tseng](https://github.com/henrytseng)
* David Pate


## License

The MIT License (MIT)

Copyright (c) 2014 Gigzolo Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
