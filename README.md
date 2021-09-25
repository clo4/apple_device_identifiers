# apple_device_identifiers

A best-effort compilation of Apple's device identifiers, starting from the late
2000s. Everything in this repository is public domain (see
[UNLICENSE](./UNLICENSE)), so you can vendor any files you need without having
to give credit.

If you notice something wrong or missing, please open an issue!

## Structure

### devices / *.json

The data sources for the files below.

### devices.json

A generated JSON file containing the aggregate of data from the JSON files
above.

### mod.ts

A generated TypeScript module that makes it easy to use this data from Deno.

### generate.ts

A Deno script that generates devices.json and mod.ts using the data in the
devices directory. See [#contributing](#contributing).

## Usage

As this project is public domain, you can vendor the JSON files you need, or
request them from githubusercontent. No crediting is required, no license to add
to a giant list.

---

There's also a TypeScript module generated for Deno. Because this repository is
not versioned, you must always pin to a specific commit hash.

<h6>deps/devices.ts</h6>

```javascript
export * from "https://raw.githubusercontent.com/SeparateRecords/apple_device_identifiers/<COMMIT>/mod.ts";
```

<h6>mod.ts</h6>

```typescript
import { AnyIdentifier, devices } from "./deps/devices.ts";

const id: AnyIdentifier = devices["iPad mini 3"];
```

## Sources

To the best of my knowledge, there's no official list of identifiers, and even
the products themselves don't always have canonical names.

As a result, the data in this repository had to be gathered from a variety of
sources:

- Various Reddit threads
- Apple's device support pages
- [This Gist](https://gist.github.com/adamawolf/3048717)
- [blacktop/ipsw](https://github.com/blacktop/ipsw) (specifically,
  [this page](https://blacktop.github.io/ipsw/docs/commands/device-list/) in the
  docs)
- everymac.com, mostly for iPhones

## Contributing

Always run the generate script before committing.

```bash
deno run --no-check --quiet -A generate.ts
```

Here's the minimum run permissions (from the root of the repository):

```bash
deno run --no-check --quiet --allow-read=devices --allow-write=devices.json,mod.ts --allow-run=deno generate.ts
```

## License

Since I'm probably not the only one who needs this, I'm releasing this to the
public domain.
