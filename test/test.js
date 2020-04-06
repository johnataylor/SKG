
var assert = require('assert');
const { Graph, literal } = require('../graph.js');

function assertContains(collection, triple) {
    const expected = Object.entries(triple).toString();
    const actual = [];
    Array.from(collection).forEach((element) => {
        actual.push(Object.entries(triple).toString());
    });
    assert(actual.includes(expected), `expected ${ JSON.stringify(triple) }`);
}

describe('Graph', function() {
  describe('assert', function() {
    it('should assert triple', function() {
        const g = new Graph();
        g.assert('s0', 'p0', 'o0');
        const triples = Array.from(g.getTriples());
        assert(triples.length === 1, 'expected 1 triple');
        assertContains(g.getTriples(), { s: 's0', p: 'p0', o: 'o0' });
    });
    it('should assert multiple triples', function() {
        const g = new Graph();
        g.assert('s0', 'p0', 'o0');
        g.assert('s0', 'p0', 'o1');
        g.assert('s0', 'p1', 'o0');
        g.assert('s0', 'p1', 'o1');
        g.assert('s1', 'p0', 'o0');
        g.assert('s1', 'p0', 'o1');
        g.assert('s1', 'p1', 'o0');
        g.assert('s1', 'p1', 'o1');
        assert(Array.from(g.getTriples()).length === 8, 'expected 8 triples');
        assertContains(g.getTriples(), { s: 's0', p: 'p0', o: 'o0' });
        assertContains(g.getTriples(), { s: 's0', p: 'p0', o: 'o1' });
        assertContains(g.getTriples(), { s: 's0', p: 'p1', o: 'o0' });
        assertContains(g.getTriples(), { s: 's0', p: 'p1', o: 'o1' });
        assertContains(g.getTriples(), { s: 's1', p: 'p0', o: 'o0' });
        assertContains(g.getTriples(), { s: 's1', p: 'p0', o: 'o1' });
        assertContains(g.getTriples(), { s: 's1', p: 'p1', o: 'o0' });
        assertContains(g.getTriples(), { s: 's1', p: 'p1', o: 'o1' });
    });
    it('should ignore duplicate asserts', function() {
        const g = new Graph();
        assert(g.assert('s0', 'p0', 'o0'));
        assert(g.assert('s0', 'p0', 'o1'));
        assert(g.assert('s0', 'p1', 'o0'));
        assert(g.assert('s0', 'p1', 'o1'));
        assert(g.assert('s1', 'p0', 'o0'));
        assert(g.assert('s1', 'p0', 'o1'));
        assert(g.assert('s1', 'p1', 'o0'));
        assert(g.assert('s1', 'p1', 'o1'));
        assert(!g.assert('s0', 'p0', 'o0'));
        assert(!g.assert('s0', 'p0', 'o1'));
        assert(!g.assert('s0', 'p1', 'o0'));
        assert(!g.assert('s0', 'p1', 'o1'));
        assert(!g.assert('s1', 'p0', 'o0'));
        assert(!g.assert('s1', 'p0', 'o1'));
        assert(!g.assert('s1', 'p1', 'o0'));
        assert(!g.assert('s1', 'p1', 'o1'));
        assert(Array.from(g.getTriples()).length === 8, 'expected 8 triples');
    });
  });
  describe('retract', function() {
    it('should retract triple', function() {
        const g = new Graph();
        g.assert('s0', 'p0', 'o0');
        g.retract('s0', 'p0', 'o0');
        const triples = Array.from(g.getTriples());
        assert(triples.length === 0, 'expected empty');
    });
    it('should retract multiple triples', function() {
        const g = new Graph();
        g.assert('s0', 'p0', 'o0');
        g.assert('s0', 'p0', 'o1');
        g.assert('s0', 'p1', 'o0');
        g.assert('s0', 'p1', 'o1');
        g.assert('s1', 'p0', 'o0');
        g.assert('s1', 'p0', 'o1');
        g.assert('s1', 'p1', 'o0');
        g.assert('s1', 'p1', 'o1');
        g.retract('s0', 'p0', 'o0');
        g.retract('s0', 'p1', 'o0');
        g.retract('s1', 'p1', 'o0');
        g.retract('s1', 'p1', 'o1');
        g.assert('s0', 'p0', 'o0');  // re-assert
        g.assert('s1', 'p1', 'o0');  // re-assert
        assert(Array.from(g.getTriples()).length === 6, 'expected 6 triples');
        assertContains(g.getTriples(), { s: 's0', p: 'p0', o: 'o0' });
        assertContains(g.getTriples(), { s: 's0', p: 'p0', o: 'o1' });
        assertContains(g.getTriples(), { s: 's0', p: 'p1', o: 'o1' });
        assertContains(g.getTriples(), { s: 's1', p: 'p0', o: 'o0' });
        assertContains(g.getTriples(), { s: 's1', p: 'p0', o: 'o1' });
        assertContains(g.getTriples(), { s: 's1', p: 'p1', o: 'o0' });
    });
    it('should ignore duplicate retracts', function() {
        const g = new Graph();
        assert(g.assert('s0', 'p0', 'o0'));
        assert(g.assert('s0', 'p0', 'o1'));
        assert(g.assert('s0', 'p1', 'o0'));
        assert(g.assert('s0', 'p1', 'o1'));
        assert(g.assert('s1', 'p0', 'o0'));
        assert(g.assert('s1', 'p0', 'o1'));
        assert(g.assert('s1', 'p1', 'o0'));
        assert(g.assert('s1', 'p1', 'o1'));
        assert(!g.assert('s0', 'p0', 'o0'));
        assert(!g.assert('s0', 'p0', 'o1'));
        assert(!g.assert('s0', 'p1', 'o0'));
        assert(!g.assert('s0', 'p1', 'o1'));
        assert(!g.assert('s1', 'p0', 'o0'));
        assert(!g.assert('s1', 'p0', 'o1'));
        assert(!g.assert('s1', 'p1', 'o0'));
        assert(!g.assert('s1', 'p1', 'o1'));
        assert(g.retract('s0', 'p0', 'o0'));
        assert(g.retract('s0', 'p1', 'o0'));
        assert(g.retract('s1', 'p1', 'o0'));
        assert(g.retract('s1', 'p1', 'o1'));
        assert(!g.retract('s0', 'p1', 'o0'));
        assert(!g.retract('s1', 'p1', 'o0'));
        assert(Array.from(g.getTriples()).length === 4, 'expected 4 triples');
    });
  });
});