#!/usr/bin/env node

import * as node_path from "node:path"

import {
	main,
} from "./_main/index.mts"

await main(
	node_path.join(import.meta.dirname, ".."),
)
