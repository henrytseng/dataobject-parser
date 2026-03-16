'use strict';

const should = require('should');
const assert = require('assert');

const DataObjectParser = require(process.cwd() + '/lib/utils/dataobject-parser');

describe('DataObjectParser', function () {

  describe('test:unit', function () {

    describe('#set', function () {
      it('should prevent prototype pollution', function ($done) {
        let parser = new DataObjectParser();

        // Attempt to pollute the prototype
        (function () {
          parser.set('__proto__.polluted', true);
        }).should.throw('Prototype pollution attempt detected');

        // Check that the prototype was not polluted
        should.not.exist({}.polluted);
        $done();
      });

      it('Should accomplish the same as setting internal values with object literals', function ($done) {
        let d = new DataObjectParser();
        d.set('$a.b.c', 'Cabin');
        d.set('a_b.b.c', 'Syrup');

        let result = d.data();

        result.should.be.an.instanceof(Object).and.have.property("$a");
        result.should.be.an.instanceof(Object).and.have.property("a_b");
        $done();
      });

      it('Should accomplish the same as setting internal values with object literals', function ($done) {
        let d = new DataObjectParser();
        d.set('caravan.personel.leader', 'Travis');

        let o = {
          caravan: {
            personel: {
              leader: 'Travis'
            }
          }
        };
        assert.deepStrictEqual(d._data, o);

        //only one key in object
        d = new DataObjectParser();
        d.set('person', 'Andrew');
        o = {
          person: 'Andrew'
        };
        assert.deepStrictEqual(d._data, o);

        //two nested keys
        d = new DataObjectParser();
        d.set("caravan.personel.leader", "Travis");
        d.set("caravan.personel.cook", "Brent");

        o = {
          caravan: {
            personel: {
              leader: "Travis",
              cook: "Brent"
            }
          }
        };
        assert.deepStrictEqual(d._data, o);

        //two keys one with two nested keys
        d = new DataObjectParser();
        d.set('caravan.leader', 'Travis');
        d.set('caravan.cook', 'Brent');
        d.set('destination', 'Georgia');

        o = {
          caravan: {
            leader: "Travis",
            cook: "Brent"
          },
          destination: "Georgia"
        };
        assert.deepStrictEqual(d._data, o);
        $done();
      });

      it('Should overwrite already existing indexes in an array if that index is set later', function ($done) {
        let d = new DataObjectParser();
        d.set('caravan.leader', 'Travis');
        d.set('caravan.cook[0]', 'Brent');
        d.set('caravan.cook[1]', 'Brann');
        d.set('caravan.cook[0]', 'Andrew');
        let o = {
          caravan: {
            leader: "Travis",
            cook: ['Andrew', "Brann"]
          }
        };
        assert.deepStrictEqual(d._data, o);
        $done();
      });

      it('Should create an array inside car that holds other object literals', function ($done) {
        let d = new DataObjectParser();
        d.set('caravan.leader', 'Andrew');
        d.set('caravan.car[1].cook', 'Brent');
        d.set('caravan.car[2].chef', 'Bill');

        let o = {
          caravan: {
            leader: "Andrew",
            car: [, { cook: 'Brent' }, { chef: 'Bill' }]
          }
        };
        assert.deepStrictEqual(d._data, o);
        $done();
      });

      it('Should tell the difference between seting an array and setting an object', function ($done) {
        let d = new DataObjectParser();
        d.set('caravan[leader]', 'Travis');
        d.set('caravan.cook[0]', 'Andrew');
        d.set('caravan[cook][1]', 'Brann');

        let o = {
          caravan: {
            leader: "Travis",
            cook: ['Andrew', "Brann"]
          }
        };
        assert.deepStrictEqual(d._data, o);
        $done();
      });

      it("Should create on key from 'location.home'", function ($done) {
        let d = new DataObjectParser();
        d.set('["location.home"]', "New York");
        let o = {
          "location.home": "New York"
        };

        assert.deepStrictEqual(d._data, o);
        $done();
      });

      it('Should take a date object and not change it to a string', function ($done) {
        let d = new DataObjectParser();
        let date = new Date(2014, 0, 1);

        d.set('info', date);
        let newDate = d._data.info;
        assert.ok(newDate instanceof Date);
        assert.notStrictEqual(typeof newDate, 'string');
        $done();
      });

      it('Should set objects as values with non-enumerable data', function ($done) {
        let d = new DataObjectParser();
        let dataValue = {};
        Object.defineProperty(dataValue, "secretKey", { value: 123, enumerable: false });
        Object.defineProperty(dataValue, "open", { value: function () { return this.foo; }, enumerable: false });
        Object.defineProperty(dataValue, "close", { value: function () { return this.bar; }, enumerable: false });
        dataValue.publicKey = 321;

        d.set('secretObject', dataValue);
        Object.getOwnPropertyNames(d._data.secretObject).should.eql(["secretKey", "open", "close", "publicKey"]);
        d._data.secretObject.propertyIsEnumerable("secretKey").should.eql(false);
        d._data.secretObject.propertyIsEnumerable("open").should.eql(false);
        d._data.secretObject.propertyIsEnumerable("close").should.eql(false);

        $done();
      });

      it('Should throw an error if you try to make the first key an array name', function ($done) {
        let d = new DataObjectParser();
        d.set('caravan[0]', 'test').should.throw();
        $done();
      });
    });

    describe('#get', function () {
      it('Should differentiate between null and undefined values', function ($done) {
        let d = new DataObjectParser();
        d.set('abc', null);

        let result = d.data();

        assert.ok(d.get("abc") == null)
        assert.ok(typeof (d.get("def")) == 'undefined')
        $done();
      });
    });

    describe('#get', function () {
      it('Should accomplish the same as setting internal values with object literals', function ($done) {
        let d = new DataObjectParser();
        d.set('$a.b.c', 'Cabin');
        d.set('a_b.b.c', 'Syrup');

        let result = d.data();

        d.get("$a.b.c").should.equal("Cabin");
        d.get("a_b.b.c").should.equal("Syrup");
        $done();
      });

      it('Should get the value associated with a given key in an object', function ($done) {
        let d = new DataObjectParser();

        d.set('caravan.leader', 'Travis');
        d.set('caravan.cook', 'Brent');
        d.set('destination.state', 'Georgia');
        d.set('destination.city[0]', 'Atlanta');
        d.set('vehicles[].color', 'red');
        d.set('vehicles[].color', 'green');
        d.set('destination["city.first"][region]', 'East Coast');
        d.set('destination.city.region', "West Coast");

        d.get("caravan[leader]").should.equal('Travis');
        d.get("caravan.cook").should.equal("Brent");
        d.get("destination.state").should.equal('Georgia');
        d.get('destination["city"][0]').should.equal('Atlanta');
        d.get('vehicles[0].color').should.equal('red');
        d.get('vehicles[1].color').should.equal('green');
        d.get('destination["city.first"][region]').should.equal('East Coast');
        d.get('destination.city.region').should.equal('West Coast');

        d.set('destination[city].region', "Alaska");
        d.get('destination[city].region').should.equal('Alaska');

        d.set('destination["city"].region', "Hawaii");
        d.get('destination["city"].region').should.equal('Hawaii');

        d.set('destination[city][region]', "California");
        d.get('destination[city][region]').should.equal('California');

        $done();
      });

      it('Should add new elements to a created array', function ($done) {
        let d = new DataObjectParser();

        d.set('destination.city[0]', 'Atlanta');
        d.set('destination.city[1]', 'Savanah');

        d.get('destination.city[0]').should.equal('Atlanta');
        d.get('destination.city[1]').should.equal('Savanah');
        $done();
      });

      it('Should get the overwriten value rather than the original value', function ($done) {
        let d = new DataObjectParser();

        d.set('destination.city[0]', 'Atlanta');
        d.set('destination.city[1]', 'Savanah');
        d.get('destination.city[0]').should.equal('Atlanta');
        d.set("destination.city[0]", "New York");
        d.get('destination.city[0]').should.equal('New York');
        $done();
      });

      it('Should set objects as values with non-enumerable data', function ($done) {
        let d = new DataObjectParser();
        let dataValue = {};
        Object.defineProperty(dataValue, "secretKey", { value: 123, enumerable: false });
        Object.defineProperty(dataValue, "open", { value: function () { return this.foo; }, enumerable: false });
        Object.defineProperty(dataValue, "close", { value: function () { return this.bar; }, enumerable: false });
        dataValue.publicKey = 321;

        d.set('secretObject', dataValue);

        d.get("secretObject.publicKey").should.equal(321);

        assert.strictEqual(typeof d.get("secretObject.open"), 'undefined');

        $done();
      });
    });

    describe('#transpose', function () {
      it('Should take flat data and return structured DataObjectParser', function ($done) {
        let flat = {
          'location.name': "Grandma house",
          'location.city': "New Haven"
        };

        let structured = {
          _data: {
            location: {
              name: "Grandma house",
              city: "New Haven"
            }
          }
        };
        DataObjectParser.transpose(flat).should.eql(structured);
        $done();
      });
      it("Should create a structured data with one key from 'location.name'", function ($done) {
        let flat = {
          'city["location.name"]': "Grandma house"
        };

        let structured = {
          _data: {
            city: {
              "location.name": "Grandma house"
            }
          }
        };

        DataObjectParser.transpose(flat).should.eql(structured);
        $done();
      });

      it("Should create a structured data with one key from 'location.address-two'", function ($done) {
        let flat = {
          'location.address-two': 'Grandma Road'
        };
        let structured = {
          _data: {
            location: {
              "address-two": "Grandma Road"
            }
          }
        };
        DataObjectParser.transpose(flat).should.eql(structured);
        $done();
      });

      it("Should take a date object in flat and it should stay a date object in structured", function ($done) {
        let date = new Date(2014, 0, 1);

        let flat = {
          'info': date
        };

        let structured = {
          _data: {
            info: date
          }
        };

        let structuredObj = DataObjectParser.transpose(flat);
        let newDate = structuredObj._data.info;

        assert.notStrictEqual(typeof newDate, 'string');
        assert.ok(newDate instanceof Date);

        $done();
      });

      it("Should create a structured data with one key from 'metadata.foo|bar'", function ($done) {
        let flat = {
          'metadata.foo|bar': 'some-text'
        };
        let structured = {
          _data: {
            metadata: {
              'foo|bar': 'some-text'
            }
          }
        };
        DataObjectParser.transpose(flat).should.eql(structured);
        $done();
      });

      it("Should create a structured data with one key from 'metadata.foo:bar'", function ($done) {
        let flat = {
          'metadata.foo:bar': 'some-text'
        };
        let structured = {
          _data: {
            metadata: {
              'foo:bar': 'some-text'
            }
          }
        };
        DataObjectParser.transpose(flat).should.eql(structured);
        $done();
      });

      it("Should create a structured data with one key from 'metadata.foo_bar'", function ($done) {
        let flat = {
          'metadata.foo_bar': 'some-text'
        };
        let structured = {
          _data: {
            metadata: {
              'foo_bar': 'some-text'
            }
          }
        };
        DataObjectParser.transpose(flat).should.eql(structured);
        $done();
      });
    });

    describe('#untranspose', function () {
      it("Should handle a DataObjectParser or an object", function ($done) {
        let structured = {
          location: 'House on cliff',
          time: 'noon',
          duration: '4 hours',
          record: 'Beetles'
        };

        let dataParser = {
          _data: {
            location: "House on cliff",
            time: 'noon',
            duration: '4 hours',
            record: 'Beetles'
          }
        };
        let flat = {
          'location': 'House on cliff',
          'time': 'noon',
          'duration': '4 hours',
          'record': 'Beetles'
        };

        DataObjectParser.untranspose(structured).should.eql(flat);
        DataObjectParser.untranspose(dataParser).should.eql(flat);
        $done();
      });

      it('Should take object-1-layer structured data and return flat DataObjectParser', function ($done) {
        let structured = {
          location: 'House on cliff',
          time: 'noon',
          duration: '4 hours',
          record: 'Beetles'
        };

        let flat = {
          'location': 'House on cliff',
          'time': 'noon',
          'duration': '4 hours',
          'record': 'Beetles'
        };

        DataObjectParser.untranspose(structured).should.eql(flat);
        $done();
      });

      it('Should take object-2-layer structured data and return flat DataObjectParser', function ($done) {

        let structured = {
          location: {
            name: 'House on cliff',
            geo: '45, 23'
          },
          time: {
            hour: '0',
            minute: '0'
          },
          duration: '4 hours',
          record: 'Beetles'
        };

        let flat = {
          'location.name': 'House on cliff',
          'location.geo': '45, 23',
          'time.hour': '0',
          'time.minute': '0',
          duration: '4 hours',
          record: 'Beetles'
        };

        DataObjectParser.untranspose(structured).should.eql(flat);
        $done();
      });

      it('Should take object with hyphen and return correct flat DataObjectParser', function ($done) {
        let structured = {
          'location-two': 'House on cliff',
          time: 'noon',
          duration: '4 hours',
          record: 'Beetles'
        };
        let flat = {
          'location-two': 'House on cliff',
          'time': 'noon',
          'duration': '4 hours',
          'record': 'Beetles'
        };
        DataObjectParser.untranspose(structured).should.eql(flat);
        $done();
      });

      it("Should take object-3-layer structured data and return flat DataObjectParser", function ($done) {
        let structured = {
          location: {
            city: {
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

        let flat = {
          'location.city.name': 'House on cliff',
          'location.city.geo': '45, 23',
          'time.hour': '0',
          'time.minute': '0',
          duration: '4 hours',
          record: 'Beetles'
        };

        DataObjectParser.untranspose(structured).should.eql(flat);
        $done();
      });

      it("Should take a structured object containing array and return a flat DataObjectParser", function ($done) {
        let structured = {
          location: {
            city: {
              name: "House on cliff",
              geo: '45, 23'
            },
            rooms: ["kitchen", "bathroom"]
          }
        };

        let flat = {
          'location.city.name': 'House on cliff',
          'location.city.geo': '45, 23',
          "location.rooms[0]": "kitchen",
          "location.rooms[1]": "bathroom"
        };

        DataObjectParser.untranspose(structured).should.eql(flat);
        $done();
      });

      it("Should take a structured object containing array multiple items and return a flat DataObjectParser", function ($done) {
        let structured = {
          tracking: true,
          blocked: true,
          nsfw: false,
          categories: {
            subscribed: ['xag2vJYrDJdsyZfah', 'abpxCb6pN3aR4piMw'],
            blocked: []
          },
          sources: {
            subscribed: ['4QSh8AqECuPauHFor'],
            blocked: []
          }
        };

        let flat = {
          'tracking': true,
          'blocked': true,
          'nsfw': false,
          'categories.subscribed[0]': 'xag2vJYrDJdsyZfah',
          'categories.subscribed[1]': 'abpxCb6pN3aR4piMw',
          'sources.subscribed[0]': '4QSh8AqECuPauHFor'
        };

        DataObjectParser.untranspose(structured).should.eql(flat);
        $done();
      });

      it('Should take an object that has an array with an object nested in it and return aflat DataObjectParser', function ($done) {
        let structured = {
          location: {
            city: {
              name: "House on cliff",
              geo: '45, 23'
            },
            rooms: [{
              name: "kitchen",
              purpose: "cooking"
            },
              "bathroom"
            ]
          }
        };

        let flat = {
          'location.city.name': 'House on cliff',
          'location.city.geo': '45, 23',
          "location.rooms[0].name": "kitchen",
          "location.rooms[0].purpose": "cooking",
          "location.rooms[1]": "bathroom"
        };

        DataObjectParser.untranspose(structured).should.eql(flat);
        $done();
      });

      it("Shouldn't break if value is null or undefined", function ($done) {
        let structured = {
          info: {
            name: null,
            address: undefined
          }
        };
        let flat = {
          'info.name': null
        };

        DataObjectParser.untranspose(structured).should.eql(flat);
        $done();
      });

      it('Should handle multiple bracket notated keys that point to arrays', function ($done) {
        let structured = {
          info: {
            "a.b": [
              { "c.d": [{ "g.h": "Hello" }] },
              { "e.f": [{ "i.j": "There" }] }
            ]
          }
        };

        let flat = {
          'info["a.b"][0]["c.d"][0]["g.h"]': "Hello",
          'info["a.b"][1]["e.f"][0]["i.j"]': "There"
        };

        DataObjectParser.untranspose(structured).should.eql(flat);
        $done();
      });

      it('Should handle complicated object combinations', function ($done) {
        let structured = {
          events: {
            location: {
              city: {
                town: {
                  neighborhood: "nowhere"
                }
              }
            },
            cost: 300,
            client: [{ name: "Andrew" },
            {
              adress: {
                'street.name': [
                  "Main Street",
                  { number: 12 }
                ],
                "zipcode": 12345
              }
            },
            {
              phonenumber: [
                { home: "123-123-1234" },
                { cell: "321-321-4321" }
              ]
            }
            ]
          }
        };

        let flat = {
          "events.location.city.town.neighborhood": "nowhere",
          'events.cost': 300,
          'events.client[0].name': "Andrew",
          'events.client[1].adress["street.name"][0]': "Main Street",
          'events.client[1].adress["street.name"][1].number': 12,
          'events.client[1].adress.zipcode': 12345,
          'events.client[2].phonenumber[0].home': "123-123-1234",
          'events.client[2].phonenumber[1].cell': "321-321-4321"
        };

        DataObjectParser.untranspose(structured).should.eql(flat);
        $done();
      });

      it("A string of form 'null' should stay 'null'", function ($done) {
        let structured = {
          info: {
            name: "null"
          }
        };
        let flat = {
          'info.name': "null"
        };

        DataObjectParser.untranspose(structured).should.eql(flat);
        $done();
      });

      it("Should make a boolean should stay a boolean", function ($done) {
        let structured = {
          info: {
            "true": true,
            "false": false
          }
        };

        let flat = {
          "info.true": true,
          "info.false": false
        };

        DataObjectParser.untranspose(structured).should.eql(flat);
        $done();
      });

      it("Should skip over non-enumerable data", function ($done) {

        let dataValue = {};
        Object.defineProperty(dataValue, "secretKey", { value: 123, enumerable: false });
        Object.defineProperty(dataValue, "open", { value: function () { return this.foo; }, enumerable: false });
        Object.defineProperty(dataValue, "close", { value: function () { return this.bar; }, enumerable: false });
        dataValue.publicKey = 321;

        let structured = {
          container: {
            info: "This is data",
            data: dataValue
          }
        };

        let flat = {
          "container.info": "This is data",
          "container.data.publicKey": 321
        };

        let d = DataObjectParser.untranspose(structured);
        d.should.eql(flat);

        $done();
      });

      it("Test what untranspose returns if a Date object in the structured object", function ($done) {
        let date = new Date(2014, 0, 1);

        let structured = {
          info: date
        };

        let flat = {
          info: date
        };

        let flatObj = DataObjectParser.untranspose(structured);
        let newDate = flatObj.info;
        assert.notStrictEqual(typeof newDate, 'string');
        assert.ok(newDate instanceof Date);

        $done();
      });

      it('Should handle pipes correctly as part of a variable name', function ($done) {
        let structured = {
          metadata: {
            'foo|bar': 'some-text'
          }
        };

        let flat = {
          'metadata.foo|bar': "some-text"
        };

        DataObjectParser.untranspose(structured).should.eql(flat);
        $done();
      });

      it('Should handle colons in naming correctly as part of a variable name', function ($done) {
        let structured = {
          metadata: {
            'b:c': 'some-text'
          }
        };

        let flat = {
          'metadata.b:c': "some-text"
        };

        DataObjectParser.untranspose(structured).should.eql(flat);
        $done();
      });

      it('Should handle underscores correctly as part of a variable name', function ($done) {
        let structured = {
          metadata: {
            'foo_bar': 'some-text'
          }
        };

        let flat = {
          'metadata.foo_bar': "some-text"
        };

        DataObjectParser.untranspose(structured).should.eql(flat);
        $done();
      });

      it('Should handle "$" correctly as part of a variable name', function ($done) {
        let structured = {
          metadata: {
            'foo_$bar': 'some-text',
            'foo_bar': 'some-other-text'
          }
        };

        let flat = {
          'metadata.foo_$bar': "some-text",
          'metadata.foo_bar': "some-other-text"
        };

        DataObjectParser.untranspose(structured).should.eql(flat);
        $done();
      });
    });

  });
});
