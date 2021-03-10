import { Run } from "code/run";

it("runs code", async () => {
  const runs = await Run.cases((a, b) => Promise.resolve(a + b), [
    { inputs: [2, 3], output: undefined },
  ]);

  expect(runs).toHaveLength(1);
  expect(runs[0]).toHaveProperty("output");
  expect(runs[0].output).toEqual(5);
});
