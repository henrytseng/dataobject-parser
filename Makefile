
MOCHA= ./node_modules/.bin/mocha

test: test-unit

test-unit:
	@NODE_ENV=test $(MOCHA) \
		--bail 
		
clean:

.PHONY: test test-unit clean
