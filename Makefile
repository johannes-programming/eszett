.ONESHELL:
.PHONY: all add amend beautiful build clean commit dist echo jacobus rebase reset json_sorted works

ZIP :=
SHELL := /bin/zsh

all:

add:
	git add -A;

amend: add
	git commit --amend --no-edit;

beautiful: jacobus json_sorted

build: src/eszett
	mkdir -p ./dist
	cd src/eszett && zip -rq ../../dist/eszett.zip . \
		-x "*.DS_Store" \
		-x "__MACOSX/*"

clean:
	rm -fr 'dist/';

commit: add
	git commit --allow-empty $(PARAMS);

dist: clean build

echo:
	echo $(PARAMS);

jacobus: works
	conda run -n works pip install 'jacobus>=2.1,<3' >/dev/null;
	conda run -n works python -m jacobus @make/jacobus.txt;

rebase:
	git rebase --empty=drop --interactive $(PARAMS);

reset:
	git reset HEAD~1

json_sorted: works
	conda run -n works pip install 'json_sorted>=1.0,<2' >/dev/null;
	conda run -n works python -m json_sorted @make/json_sorted.txt;

works:
	conda run -n base python make/env.py works --python=3.11;
