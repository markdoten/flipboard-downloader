export PHANTOMJS_EXECUTABLE := node_modules/.bin/phantomjs

.PHONY: clean run

all: install

clean:
	rm -rf node_modules

install: node_modules

node_modules: package.json
	npm install
	touch $@

MAGS=cool
run:
	./node_modules/.bin/phantomjs ./src/phantom/download.js $(USER) $(PASS)
