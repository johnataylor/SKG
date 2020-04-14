
function literal(value, type) {
    return { value: value, type: type || 'string' };
}

function label(graph, id, s) {
    graph.assert(id, 'rdfs:label', literal(s));
}

function serialize(graph) {
    const result = { graph: {} };
    for (const s of graph.getSubjects()) {
        result.graph[s.value] = {};
        for (const p of s.getPredicates()) {
            result.graph[s.value][p.value] = [];
            for (const o of p.getObjects()) {
                result.graph[s.value][p.value].push(o);
            }
        }
    }
    return result;
}

function deserialize(obj) {
    const result = new Graph();
    for (const s in obj.graph) {
        for (const p in obj.graph[s]) {
            obj.graph[s][p].forEach((o) => { result.assert(s, p, o); });
        }
    }
    return result;
}

class GraphSubjectPredicate {

    constructor(p, o) {
        this.value = p;
        this.o = o;
    }

    *getObjects() {
        for (const obj in this.o) {
            yield JSON.parse(obj);
        }
    }
}

class GraphSubject {
    
    constructor(s, po) {
        this.value = s;
        this.po = po;
    }

    *getPredicates() {
        for (const p in this.po) {
            yield new GraphSubjectPredicate(p, this.po[p]);
        }
    }
}

class Graph {

    constructor() {
        this.count = 0;
        this.spo = {};
        this.pos = {};
        this.osp = {};
        this.namespace = {};
    }

    setNamespace(prefix, uri) {
        this.namespace[prefix] = uri;
    }

    getNamespace(prefix) {
        return this.namespace[prefix];
    }

    assert(s, p, obj) {
        const o = JSON.stringify(obj);
        let added = false;
        added |= this.addToIndex(this.spo, s, p, o);
        added |= this.addToIndex(this.pos, p, o, s);
        added |= this.addToIndex(this.osp, o, s, p);
        if (added) {
            this.count++;
        }
        return added;
    }

    retract(s, p, obj) {
        const o = JSON.stringify(obj);
        let removed = false;
        removed |= this.removeFromIndex(this.spo, s, p, o);
        removed |= this.removeFromIndex(this.pos, p, o, s);
        removed |= this.removeFromIndex(this.osp, o, s, p);
        if (removed) {
            this.count--;
        }
        return removed;
    }

    merge(graph) {
        for (const triple of graph.getTriples()) {
            this.assert(triple.s, triple.p, triple.o);
        }
    }

    minus(graph) {
        for (const triple of graph.getTriples()) {
            this.retract(triple.s, triple.p, triple.o);
        }
    }

    addToIndex(indexX, x, y, z) {
        var indexY = indexX[x];
        if (indexY === undefined) {
            indexY = {};
            indexX[x] = indexY;
        }
        var indexZ = indexY[y];
        if (indexZ === undefined) {
            indexZ = {};
            indexY[y] = indexZ;
        }
        
        if (indexZ.hasOwnProperty(z)) {
            return false;
        }
        else {
            indexZ[z] = true;
            return true;
        }
    }

    removeFromIndex(indexX, x, y, z) {
        var indexY = indexX[x];
        if (indexY === undefined) {
            return false;
        }
        var indexZ = indexY[y];
        if (indexZ === undefined) {
            return false;
        }

        const result = indexZ[z] !== undefined;

        delete indexZ[z];

        if (Object.keys(indexZ).length === 0) {
            delete indexY[y];
            if (Object.keys(indexY).length === 0) {
                delete indexX[x];
            }
        }

        return result;
    }

    *getTriples() {
        for (const s in this.spo) {
            for (const p in this.spo[s]) {
                for (const o in this.spo[s][p]) {
                    yield { s: s, p: p, o: JSON.parse(o) };
                }
            }
        }
    }

    *getBySubject(s) {
        const items = this.spo[s];
        if (items === undefined) {
            return;
        }
        for (const p in items) {
            for (const o in items[p]) {
                yield { s: s, p: p, o: JSON.parse(o) };
            }
        }
    }

    *getBySubjectPredicate(s, p) {
        const itemsS = this.spo[s];
        if (itemsS === undefined) {
            return;
        }
        const itemsP = itemsS[p];
        if (itemsP === undefined) {
            return;
        }
        for (const o in itemsP) {
            yield { s: s, p: p, o: JSON.parse(o) };
        }
    }

    *getByPredicate(p) {
        const items = this.pos[p];
        if (items === undefined) {
            return;
        }
        for (const o in items) {
            for (const s in items[o]) {
                yield { s: s, p: p, o: JSON.parse(o) };
            }
        }
    }

    *getByPredicateObject(p, obj) {
        const o = JSON.stringify(obj);
        const itemsP = this.pos[p];
        if (itemsP === undefined) {
            return;
        }
        const itemsO = itemsP[o];
        if (itemsO === undefined) {
            return;
        }
        for (const s in itemsO) {
            yield { s: s, p: p, o: JSON.parse(o) };
        }
    }

    *getByObject(obj) {
        const o = JSON.stringify(obj);
        const items = this.osp[o];
        if (items === undefined) {
            return;
        }
        for (const s in items) {
            for (const p in items[s]) {
                yield { s: s, p: p, o: JSON.parse(o) };
            }
        }
    }

    *getByObjectSubject(obj, s) {
        const o = JSON.stringify(obj);
        const itemsO = this.osp[o];
        if (itemsO === undefined) {
            return;
        }
        const itemsS = itemsO[s];
        if (itemsS === undefined) {
            return;
        }
        for (const p in itemsS) {
            yield { s: s, p: p, o: JSON.parse(o) };
        }
    }

    *getSubjects() {
        for (const s in this.spo) {
            yield new GraphSubject(s, this.spo[s]);
        }
    }

    toString() {
        const result = [];
        for (const { s, p, o } of this.getTriples()) {
            result.push(`${ s } ${ p } ${ JSON.stringify(o) } .`);
        }
        return result.join('\n');
    }
}

exports.literal = literal;
exports.label = label;
exports.serialize = serialize;
exports.deserialize = deserialize;
exports.Graph = Graph;
