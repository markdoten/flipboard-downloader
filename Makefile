.PHONY: clean run run_debug

all: install

clean:
	rm -rf node_modules

install: node_modules

node_modules: package.json
	npm install
	touch $@

EXCLUDE=
MAGS=
OUTPUT=

run:
	./node_modules/.bin/phantomjs ./src/download.js \
	user=$(USER) pass=$(PASS) mags="$(MAGS)" exclude="$(EXCLUDE)" output="$(OUTPUT)"

run_debug:
	./node_modules/.bin/phantomjs --remote-debugger-port=9000 ./src/download.js \
	user=$(USER) pass=$(PASS) mags="$(MAGS)" exclude="$(EXCLUDE)" output="$(OUTPUT)"
