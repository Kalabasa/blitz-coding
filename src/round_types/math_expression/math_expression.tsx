import { RoundGenerator } from "game/generate";
import { Difficulty } from "game/types";
import { pick, randomInt, rangeCases, shuffle } from "round_types/utils";
import { createPlainCaseGridGraphics } from "ui/puzzle_graphics/graphics";

const mathExpression = (seed: any, terms: number, budget: number) => {
  const leafProvider = createLeafProvider();
  const expression = generateExpression(leafProvider, budget).expression;
  leafProvider.finalize(terms);

  return {
    time: 30 + terms * 30 + Math.floor(budget * 0.1) * 10,
    suite: {
      funcName: "math",
      inputNames: ["n"],
      cases: rangeCases(1, 20, (i) => {
        const n = randomInt(Math.floor(curve(i)), Math.floor(curve(i + 1)) - 1);
        return {
          inputs: [n],
          output: expression(n),
        };
      }),
    },
    Graphics: createPlainCaseGridGraphics(3, 3),
  };
};

export const createMathExpression: RoundGenerator = {
  minDifficulty: Difficulty.Easy,
  weight: 1,
  create: (difficulty: Difficulty) => ({
    fn: mathExpression,
    params: [
      Math.random(),
      difficulty <= Difficulty.Medium ? 1 : 3,
      difficulty <= Difficulty.Easy
        ? 6
        : difficulty <= Difficulty.Medium
        ? 30
        : difficulty <= Difficulty.Hard
        ? 30
        : 60,
    ],
  }),
};

function curve(i: number, d: number = 512): number {
  return d <= 0 ? i : curve(i, d - 1) ** 1.0004;
}

type Expression = (n: number) => number;
type Functions = {
  [k in string]: {
    create: (...args: any[]) => Expression;
    cost: (depth: number) => number;
  };
};

type LeafProvider = {
  allocate(): SingleLeafProvider;
  finalize(numOfTerms: number): void;
};
type SingleLeafProvider = {
  get(n: number): number;
};

function generateExpression(
  leafProvider: LeafProvider,
  budget: number,
  depth: number = 0
): { expression: Expression; budgetLeft: number } {
  const nextMinCost = functions.leaf.cost(depth + 1);

  const available = filterFunctions(budget - nextMinCost * 2, depth);
  const { leaf: _, ...availableOp } = available;

  if (!Object.values(availableOp).length) {
    return {
      expression: functions.leaf.create(leafProvider.allocate()),
      budgetLeft: budget - functions.leaf.cost(depth),
    };
  }

  const opCosts = Object.values(availableOp).map((f) => ({
    ...f,
    evalCost: f.cost(depth),
  }));
  const minOp = opCosts.reduce((min, cur) =>
    min.evalCost < cur.evalCost ? min : cur
  );

  const childBudget = budget - minOp.evalCost;
  const leftBudget =
    nextMinCost + Math.random() * (childBudget - nextMinCost * 2);
  const rightBudget = childBudget - leftBudget;

  const generateLeft = generateExpression(leafProvider, leftBudget, depth + 1);
  const generateRight = generateExpression(
    leafProvider,
    rightBudget,
    depth + 1
  );
  const childCost =
    childBudget - generateLeft.budgetLeft - generateRight.budgetLeft;

  const opBudget = budget - childCost;
  const op = pick(opCosts.filter((op) => op.evalCost <= opBudget));

  const expression = op.create(
    generateLeft.expression,
    generateRight.expression
  );

  const budgetLeft = budget - op.evalCost - childCost;

  return {
    expression,
    budgetLeft,
  };
}

function filterFunctions(budget: number, depth: number): Functions {
  const result: any = {};
  for (let k in functions) {
    const func = (functions as Functions)[k];
    if (func.cost(depth) <= budget) {
      result[k] = func;
    }
  }
  return result;
}

const functions = {
  leaf: {
    create: (provider: SingleLeafProvider) => (n: number) => provider.get(n),
    cost: (depth: number) => 1 / (1 + depth),
  },
  sum: {
    create: (a: Expression, b: Expression) => (n: number) => a(n) + b(n),
    cost: (depth: number) => 1 + 1 / (1 + depth),
  },
  difference: {
    create: (a: Expression, b: Expression) => (n: number) => a(n) - b(n),
    cost: (depth: number) => 1 + 2 / (1 + depth),
  },
  product: {
    create: (a: Expression, b: Expression) => (n: number) => a(n) * b(n),
    cost: (depth: number) => 2 + 2 * depth,
  },
  quotient: {
    create: (a: Expression, b: Expression) => (n: number) => a(n) / b(n),
    cost: (depth: number) => 6 + 6 * depth,
  },
  remainder: {
    create: (a: Expression, b: Expression) => (n: number) => a(n) % b(n),
    cost: (depth: number) => 4 + 4 * depth,
  },
  exponent: {
    create: (a: Expression, b: Expression) => (n: number) => a(n) ** b(n),
    cost: (depth: number) => 8 + 4 * depth,
  },
};

function createLeafProvider(): LeafProvider {
  let allocations = 0;
  const values: (number | null)[] = [];

  return {
    allocate() {
      const index = allocations;
      allocations++;
      return {
        get: (n: number) => values[index] ?? n,
      };
    },

    finalize(numOfTerms: number) {
      for (let i = 0; i < allocations; i++) {
        values[i] = i < numOfTerms ? null : randomInt(1, 4);
      }
      shuffle(values);
    },
  };
}
