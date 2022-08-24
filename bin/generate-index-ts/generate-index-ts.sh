#!/bin/sh

cd $1

find * -maxdepth 0 -type d | \
	sort | \
	sort -k4 | \
	awk '{print "export * from \47./"$1"/index.js\47"}'

F="$(ls . | sort | grep '\.svelte$')"
if [[ ! -z $F ]]; then
	echo "import 'svelte'"
fi

echo "$F" | \
 	sed 's/\.svelte$//' | \
	uniq | \
  sort -k4 | \
	awk '{print "echo "$1" $(echo "$1" | tr '\''-'\'' '\''_'\'')"}' | sh | \
	awk '{print "export * as "$2" from \47./"$1".svelte\47"}'

F="$(
	ls . | \
	sort | \
	grep -e '\.ts$' | \
	sed 's/\.ts$//' | \
	uniq | \
	grep -v -e '^index$'
)"
if [[ ! -z $F ]]; then
	echo "$F" \
		sort -k4 | \
		awk '{print "export * from \47./"$1".js\47"}'
fi

F="$(
	ls . | \
	sort | \
	grep -e '\.tsx$' | \
	sed 's/\.tsx$//' | \
	uniq | \
	grep -v -e '^index$'
)"
if [[ ! -z $F ]]; then
	echo "$F" \
		sort -k4 | \
		awk '{print "export * from \47./"$1".jsx\47"}'
fi
