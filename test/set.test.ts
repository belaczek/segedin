import test from 'ava'
import { set } from 'segedin/set'

test('basic tree update', t => {
  const tree = { b: { c: true }, d: { e: true } }
  const updatedTree = set(tree, _ => _.b.c)(false)

  t.notDeepEqual(tree, updatedTree)
  t.is(tree.b.c, true)
  t.is(updatedTree.b.c, false)
})

test('accepts thunk as a value', async t => {
  const tree = { b: { c: true } }
  const updatedTree = set(tree, _ => _.b.c)(c => !c)

  t.notDeepEqual(tree, updatedTree)
  t.is(tree.b.c, true)
  t.is(updatedTree.b.c, false)
})

test('returns same tree if target identity equality', async t => {
  // Pass the same primitive value as replacement
  const tree = { a: { b: { c: 42 } } }
  const updatedTree = set(tree, _ => _.a.b.c)(42)
  t.is(updatedTree, tree)

  // Pass the same subtree as replacement
  const tree2 = { a: { b: { c: 42 } } }
  const updatedTree2 = set(tree2, _ => _.a.b)(tree2.a.b)
  t.is(updatedTree2, tree2)
})

test('returns same tree if target structural equality', async t => {
  const tree = { a: { b: { c: 42 } } }
  const updatedTree = set(tree, _ => _.a.b)({ c: 42 })
  t.is(updatedTree, tree)
})

test('does not transform arrays to objects', async t => {
  const tree = {
    title: 'Hello',
    subjects: [{ name: 'John', age: 26 }, { name: 'Marvin', age: 42 }],
  }

  const updatedTree = set(tree, _ => _.subjects[0].name)('Bobby')

  t.true(Array.isArray(updatedTree.subjects))
  t.is(updatedTree.subjects.length, 2)
  t.is(updatedTree.subjects[0].name, 'Bobby')
  t.is(updatedTree.subjects[1].name, 'Marvin')

  const updatedTree2 = set(tree, _ => _.subjects[1].name)('Bobby')

  t.true(Array.isArray(updatedTree2.subjects))
  t.is(updatedTree2.subjects.length, 2)
  t.is(updatedTree2.subjects[0].name, 'John')
  t.is(updatedTree2.subjects[1].name, 'Bobby')
})

test('preserves the prototype of the tree', async t => {
  const tree: {
    a: number
    b: { c: number }
    d: { e: number }
  } = Object.assign(
    Object.create({
      a: 1,
      b: { c: 2 },
    }),
    {
      d: { e: 3 },
    },
  )

  const updatedTree = set(tree, _ => _.d.e)(4)

  t.is(updatedTree.a, 1)
  t.is(updatedTree.b, tree.b)

  const updatedTree2 = set(tree, _ => _.d.e)(3)
  t.is(updatedTree2, tree)
})
