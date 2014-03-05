DataObject Parser
=================

A nodejs module designed to parse an Object hash transposing between dot-notation and a structured heirarchy of Objects/Arrays.  

Translating code between 

## TL;DR

String programming should be avoided.  

This module was a quick work around to store our [MongoDb](http://www.mongodb.org/) documents in [Backbone.js](http://backbonejs.org/) models.  Our Backbonejs.model  dispatched events from data in a complex hierarchal structure.  


## Installation

	$ npm install dataobject-parser

## Quick Start

Instantiate a new instance of DataObjectParser to manage an object:

	var d = new DataObjectParser();


Set using dot-notation:

	d.set("caravan.personel.leader","Travis");
	d.set("caravan.personel.cook","Brent");


The Object returned should be the equivalent structured object:

	var obj = d.data();

That is, where ```obj``` is equivalent to:

	var obj = {
		caravan:{
			personel:{
				leader:"Travis",
				cook:"Brent"
			}
		}
	};





## License

The MIT License (MIT)

Copyright (c) 2014 Gigzolo Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
