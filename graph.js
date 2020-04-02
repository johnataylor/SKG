
function literal(value, type) {
    return { value: value, type: type || 'string' };
}

function label(graph, id, s) {
    graph.label(id, 'rdfs:label', s);
}

class Graph {

    constructor() {
        this.spo = {};
        this.pos = {};
        this.osp = {};
    }

    assert(s, p, obj) {
        const o = JSON.stringify(obj);
        let added = false;
        added |= this.addToIndex(this.spo, s, p, o);
        added |= this.addToIndex(this.pos, p, o, s);
        added |= this.addToIndex(this.osp, o, s, p);
        return added;
    }

    retract(s, p, obj) {
        const o = JSON.stringify(obj);
        let added = false;
        added |= this.removeFromIndex(this.spo, s, p, o);
        added |= this.removeFromIndex(this.pos, p, o, s);
        added |= this.removeFromIndex(this.osp, o, s, p);
        return added;
    }

    get count() {
        let count = 0;
        for (const triple of this.getTriples()) {
            count++;
        }
        return count;
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
        return true;
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
}

exports.literal = literal;
exports.label = label;
exports.Graph = Graph;
