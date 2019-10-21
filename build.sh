rm -rf .next;
./node_modules/.bin/next build;
tsc -p tsconfig.server.json;