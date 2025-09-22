export async function* mergeAsyncIterators<T>(iterators: AsyncIterable<T>[]) {
  const readers = iterators.map((it) => it[Symbol.asyncIterator]());
  const nexts = readers.map((r, i) => r.next().then((res) => ({ i, res })));

  for (;;) {
    const { i, res } = await Promise.race(nexts);

    if (res.done) {
      return; // end the whole merged stream if one closes
    }

    yield res.value;

    // immediately queue the next value from the same iterator
    nexts[i] = readers[i].next().then((res) => ({ i, res }));
  }
}
