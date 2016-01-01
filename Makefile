export PHANTOMJS_EXECUTABLE := node_modules/.bin/phantomjs

.PHONY: clean run

all: install

clean:
	rm -rf node_modules

install: node_modules

node_modules: package.json
	npm install
	touch $@

run:
	./node_modules/.bin/casperjs --web-security=no ./download.js --username=$(USER) --password=$(PASS) --magazines=$(MAGS)
