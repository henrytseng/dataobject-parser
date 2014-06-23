var should = require('should');
var _ = require('underscore');

var DataObjectParser = require('../lib/utils/dataobject-parser');

describe('DataObjectParser', function(){

    describe('test:unit',function(){

        /*-------------Set-------------*/
        describe('#set',function(){
            it('should accomplish the same as setting internal values with object literals', function($done) {
                var d = new DataObjectParser();
                d.set('caravan.personel.leader', 'Travis');

                var o = {
                    caravan: {
                        personel:{
                            leader:'Travis'
                        }
                    }
                };
                _.isEqual(d._data,o).should.equal(true);

                //only one key in object
                d = new DataObjectParser();
                d.set('person','Andrew');
                o ={
                    person:'Andrew'
                };
                _.isEqual(d._data,o).should.equal(true);

                //two nested keys
                d = new DataObjectParser();
                d.set("caravan.personel.leader","Travis");
                d.set("caravan.personel.cook","Brent");

                o ={
                    caravan:{
                        personel:{
                            leader:"Travis",
                            cook:"Brent"
                        }
                    }
                };
                _.isEqual(d._data,o).should.equal(true);

                //two keys one with two nested keys
                d = new DataObjectParser();
                d.set('caravan.leader','Travis');
                d.set('caravan.cook','Brent');
                d.set('destination','Georgia');

                o ={
                    caravan:{
                        leader:"Travis",
                        cook:"Brent"
                    },
                    destination:"Georgia"
                };
                _.isEqual(d._data,o).should.equal(true);
                $done();
            });

            it('should overwrite already existing indexes in an array if that index is set later',function($done){
                var d = new DataObjectParser();
                d.set('caravan.leader','Travis');
                d.set('caravan.cook[0]','Brent');
                d.set('caravan.cook[1]', 'Brann');
                d.set('caravan.cook[0]', 'Andrew');
                var o ={
                    caravan:{
                        leader: "Travis",
                        cook:['Andrew',"Brann"]
                    }
                };
                _.isEqual(d._data,o).should.equal(true);
                $done();
            });

            it('should create an array inside car that holds other object literals',function($done){
                var d = new DataObjectParser();
                d.set('caravan.leader','Andrew');
                d.set('caravan.car[1].cook','Brent');
                d.set('caravan.car[2].chef','Bill');

                var o ={
                    caravan:{
                        leader: "Andrew",
                        car:[undefined,{cook:'Brent'},{chef:  'Bill'}]
                    }
                };
                _.isEqual(d._data,o).should.equal(true);
                $done();
            });

            it('should tell the difference between seting an array and setting an object',function($done){
                var d = new DataObjectParser();
                d.set('caravan[leader]','Travis');
                d.set('caravan.cook[0]','Andrew');
                d.set('caravan[cook][1]','Brann');

                var o ={
                    caravan:{
                        leader: "Travis",
                        cook:['Andrew',"Brann"]
                    }
                };
                _.isEqual(d._data,o).should.equal(true);
                $done();
            });

            it("should create on key from 'location.home'",function($done){
                var d = new DataObjectParser();
                d.set('["location.home"]',"New York");
                var o={
                    "location.home": "New York"
                };

                _.isEqual(d._data,o).should.equal(true);
                $done();
            });

            it('should take a date object and not change it to a string',function($done){
                var d = new DataObjectParser();
                var date = new Date(2014,0,1);

                d.set('info',date);
                var newDate = d._data.info;
                _.isDate(newDate).should.eql(true);
                _.isString(newDate).should.eql(false);
                $done();
            });

            it('should set objects as values with non-enumerable data',function($done){
                var d = new DataObjectParser();
                var dataValue = {};
                Object.defineProperty(dataValue,"secretKey",{value: 123, enumerable: false});
                Object.defineProperty(dataValue,"open",{value: function(){return this.foo;}, enumerable: false});
                Object.defineProperty(dataValue,"close",{value: function(){return this.bar;}, enumerable: false});
                dataValue.publicKey = 321;

                d.set('secretObject', dataValue);
                Object.getOwnPropertyNames(d._data.secretObject).should.eql(["secretKey","open","close","publicKey"]);
                d._data.secretObject.propertyIsEnumerable("secretKey").should.eql(false);
                d._data.secretObject.propertyIsEnumerable("open").should.eql(false);
                d._data.secretObject.propertyIsEnumerable("close").should.eql(false);

                $done();
            });

            it('should throw an error if you try to make the first key an array name',function($done){
                var d = new DataObjectParser();
                d.set('caravan[0]','test').should.throw();
                $done();
            });
        });

        /*-------------Get-------------*/
        describe('#get',function(){
            it('should get the value associated with a given key in an object',function($done){
                var d = new DataObjectParser();

                d.set('caravan.leader','Travis');
                d.set('caravan.cook','Brent');
                d.set('destination.state','Georgia');
                d.set('destination.city[0]','Atlanta');
                d.set('vehicles[].color','red');
                d.set('vehicles[].color','green');
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

            it('should add new elements to a created array',function($done){
                var d = new DataObjectParser();

                d.set('destination.city[0]','Atlanta');
                d.set('destination.city[1]','Savanah');

                d.get('destination.city[0]').should.equal('Atlanta');
                d.get('destination.city[1]').should.equal('Savanah');
                $done();
            });

            it('should get the overwriten value rather than the original value',function($done){
                var d = new DataObjectParser();

                d.set('destination.city[0]','Atlanta');
                d.set('destination.city[1]','Savanah');
                d.get('destination.city[0]').should.equal('Atlanta');
                d.set("destination.city[0]","New York");
                d.get('destination.city[0]').should.equal('New York');
                $done();
            });

            it('should set objects as values with non-enumerable data',function($done){
                var d = new DataObjectParser();
                var dataValue = {};
                Object.defineProperty(dataValue,"secretKey",{value: 123, enumerable: false});
                Object.defineProperty(dataValue,"open",{value: function(){return this.foo;}, enumerable: false});
                Object.defineProperty(dataValue,"close",{value: function(){return this.bar;}, enumerable: false});
                dataValue.publicKey = 321;

                d.set('secretObject', dataValue);

                d.get("secretObject.publicKey").should.equal(321);

                _.isUndefined(d.get("secretObject.open")).should.equal(true);

                $done();
            });
        });

        /*-------------Transpose-------------*/
        describe('#transpose',function(){
            it('should take flat data and return structured DataObjectParser',function($done){
                var flat = {
                    'location.name': "Grandma house",
                    'location.city': "New Haven"
                };

                var structured = {
                    _data:{
                        location: {
                            name: "Grandma house",
                            city: "New Haven"
                        }
                    }
                };
                DataObjectParser.transpose(flat).should.eql(structured);
                $done();
            });
            it("should create a structured data with one key from 'location.name'",function($done){
                var flat = {
                    'city["location.name"]': "Grandma house",
                };

                var structured={
                    _data:{
                        city:{
                            "location.name": "Grandma house"
                        }
                    }
                };

                DataObjectParser.transpose(flat).should.eql(structured);
                $done();
            });
            it("should create a structured data with one key from 'location.address-two'",function($done){
                var flat = {
                    'location.address-two': 'Grandma Road'
                };

                var structured={
                    _data:{
                        location:{
                            "address-two": "Grandma Road"
                        }
                    }
                };

                DataObjectParser.transpose(flat).should.eql(structured);
                $done();
            });

            it("should take a date object in flat and it should stay a date object in structured",function($done){
                var date = new Date(2014,0,1);

                var flat = {
                    'info': date,
                };

                var structured={
                    _data:{
                        info: date
                    }
                };

                var structuredObj = DataObjectParser.transpose(flat);
                var newDate = structuredObj._data.info;

                _.isString(newDate).should.eql(false);
                _.isDate(newDate).should.eql(true);

                $done();
            });
        });

        /*-------------Untranspose-------------*/
        describe('#untranspose',function(){
            it("should handle a DataObjectParser or an object",function($done){
                var structured = {
                    location: 'House on cliff',
                    time: 'noon',
                    duration: '4 hours',
                    record: 'Beetles'
                };

                var dataParser = {
                    _data:{
                        location:"House on cliff",
                        time:'noon',
                        duration:'4 hours',
                        record: 'Beetles'
                    }
                };
                var flat = {
                    'location': 'House on cliff',
                    'time': 'noon',
                    'duration': '4 hours',
                    'record': 'Beetles'
                };

                DataObjectParser.untranspose(structured).should.eql(flat);
                DataObjectParser.untranspose(dataParser).should.eql(flat);
                $done();
            });

            it('should take object-1-layer structured data and return flat DataObjectParser',function($done){
                var structured = {
                    location: 'House on cliff',
                    time: 'noon',
                    duration: '4 hours',
                    record: 'Beetles'
                };

                var flat = {
                    'location': 'House on cliff',
                    'time': 'noon',
                    'duration': '4 hours',
                    'record': 'Beetles'
                };

                DataObjectParser.untranspose(structured).should.eql(flat);
                $done();
            });

            it('should take object with hyphen and return correct flat DataObjectParser',function($done){
                var structured = {
                    'location-two': 'House on cliff',
                    time: 'noon',
                    duration: '4 hours',
                    record: 'Beetles'
                };

                var flat = {
                    'location-two': 'House on cliff',
                    'time': 'noon',
                    'duration': '4 hours',
                    'record': 'Beetles'
                };

                var flattened = DataObjectParser.untranspose(structured);
                DataObjectParser.untranspose(structured).should.eql(flat);
                $done();
            });

            it('should take object-2-layer structured data and return flat DataObjectParser',function($done){

                var structured = {
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

                var flat = {
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

            it("should take object-3-layer structured data and return flat DataObjectParser",function($done){
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

                DataObjectParser.untranspose(structured).should.eql(flat);
                $done();
            });

            it("should take a structured object containing array and return a flat DataObjectParser",function($done){
                var structured = {
                    location: {
                        city:{
                            name: "House on cliff",
                            geo: '45, 23'
                        },
                        rooms:["kitchen", "bathroom"]
                    }
                };

                var flat = {
                    'location.city.name': 'House on cliff',
                    'location.city.geo': '45, 23',
                    "location.rooms[0]": "kitchen",
                    "location.rooms[1]": "bathroom",
                };

                DataObjectParser.untranspose(structured).should.eql(flat);
                $done();
            });

            it('should take an object that has an array with an object nested in it and return aflat DataObjectParser',function($done){
                var structured = {
                    location: {
                        city:{
                            name: "House on cliff",
                            geo: '45, 23'
                        },
                        rooms:[{
                            name: "kitchen",
                            purpose: "cooking"
                        },
                            "bathroom"
                        ]
                    }
                };

                var flat = {
                    'location.city.name': 'House on cliff',
                    'location.city.geo': '45, 23',
                    "location.rooms[0].name": "kitchen",
                    "location.rooms[0].purpose": "cooking",
                    "location.rooms[1]": "bathroom",
                };

                DataObjectParser.untranspose(structured).should.eql(flat);
                $done();
            });

            it("shouldn't break if value is null or undefined",function($done){
                var structured={
                    info:{
                        name: null,
                        address: undefined
                    }
                };
                var flat ={
                    'info.name': null
                };

                DataObjectParser.untranspose(structured).should.eql(flat);
                $done();
            });

            it('should handle multiple bracket notated keys that point to arrays',function($done){
                var structured={
                    info:{
                        "a.b":[
                            {"c.d":[{"g.h":"Hello"}]},
                            {"e.f":[{"i.j":"There"}]}
                        ]
                    }
                };

                var flat={
                    'info["a.b"][0]["c.d"][0]["g.h"]':"Hello",
                    'info["a.b"][1]["e.f"][0]["i.j"]':"There",
                };

                DataObjectParser.untranspose(structured).should.eql(flat);
                $done();
            });

            it('should handle complecated object combinations',function($done){
                var structured={
                    events:{
                        location:{
                            city:{
                                town:{
                                    neighborhood:"nowhere"
                                }
                            }
                        },
                        cost:300,
                        client:[{name: "Andrew"},
                            {
                                adress:{
                                    'street.name':[
                                        "Main Street",
                                        {number: 12}
                                    ],
                                    "zipcode": 12345
                                }
                            },
                            {phonenumber:[
                                {home:"123-123-1234"},
                                {cell:"321-321-4321"}
                            ]}
                        ]
                    }
                };

                var flat={
                    "events.location.city.town.neighborhood": "nowhere",
                    'events.cost':300,
                    'events.client[0].name':"Andrew",
                    'events.client[1].adress["street.name"][0]':"Main Street",
                    'events.client[1].adress["street.name"][1].number': 12,
                    'events.client[1].adress.zipcode':12345,
                    'events.client[2].phonenumber[0].home':"123-123-1234",
                    'events.client[2].phonenumber[1].cell':"321-321-4321"
                };

                DataObjectParser.untranspose(structured).should.eql(flat);
                $done();
            });


            it("a string of form 'null' should stay 'null'",function($done){
                var structured={
                    info:{
                        name: "null"
                    }
                };
                var flat ={
                    'info.name': "null"
                };

                DataObjectParser.untranspose(structured).should.eql(flat);
                $done();
            });

            it("should make a boolean should stay a boolean",function($done){
                var structured={
                    info:{
                        "true": true,
                        "false": false
                    }
                };

                var flat={
                    "info.true":true,
                    "info.false":false
                };

                DataObjectParser.untranspose(structured).should.eql(flat);
                $done();
            });

            it("should skip over non-enumerable data",function($done){

                var dataValue = {};
                Object.defineProperty(dataValue,"secretKey",{value: 123, enumerable: false});
                Object.defineProperty(dataValue,"open",{value: function(){return this.foo;}, enumerable: false});
                Object.defineProperty(dataValue,"close",{value: function(){return this.bar;}, enumerable: false});
                dataValue.publicKey = 321;

                var structured={
                    container:{
                        info: "This is data",
                        data: dataValue
                    }
                };

                var flat={
                    "container.info": "This is data",
                    "container.data.publicKey": 321
                };

                var d = DataObjectParser.untranspose(structured);
                d.should.eql(flat);

                // console.log(Object.getOwnPropertyNames(d));
                $done();
            });


            it("test what untranspose returns if a Date object in the structured object",function($done){
                var date = new Date(2014,0,1);

                var structured={
                    info: date
                };

                var flat={
                    info: date
                };

                var flatObj = DataObjectParser.untranspose(structured);
                var newDate = flatObj.info;
                _.isString(newDate).should.eql(false);
                _.isDate(newDate).should.eql(true);

                $done();
            });
        });

    });
});