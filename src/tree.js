define([
    './util',
    'underscore'
], function (
    util,
    _
) {
    /**
     * Children is a list of objects.
     * @param children - optional
     * @param value - that value object that this node should contain (should be a Mug)
     */
    function Node(children, value) {
        this.value = value;
        this.children = children || [];
    }

    Node.prototype = {
        getChildren: function () {
            return this.children;
        },
        getValue: function () {
            return this.value;
        },
        setValue: function (val) {
            this.value = val;
            _(this.children).each(function (child) {
                child.getValue().parentMug = val;
            });
        },
        /**
         * DOES NOT CHECK TO SEE IF NODE IS IN TREE ALREADY!
         * Adds child to END of children!
         */
        addChild: function (node) {
            this.children.push(node);
        },
        /**
         * Insert child at the given index (0 means first)
         * if index > children.length, will insert at end.
         * -ve index will result in child being added to first of children list.
         */
        insertChild: function (node, index) {
            if (node === null) {
                return null;
            }

            if (index < 0) {
                index = 0;
            }

            this.children.splice(index, 0, node);
        },
        /**
         * Given a mug, finds the node that the mug belongs to.
         * if it is not the current node, will recursively look through 
         * children node (depth first search)
         */
        getNodeFromValue: function (valueOrFn) {
            if (valueOrFn === null) {
                return this.rootNode;
            }
            var valueIsFn = _.isFunction(valueOrFn),
                retVal,
                thisVal = this.getValue();

            if ((!valueIsFn && thisVal === valueOrFn) ||
                (valueIsFn && valueOrFn(thisVal)))
            {
                return this;
            } else {
                for (var i = 0; i < this.children.length; i++) {
                    retVal = this.children[i].getNodeFromValue(valueOrFn);
                    if (retVal) {
                        return retVal;
                    }
                }
            }
            return null; //we haven't found what we're looking for
        },
        getNodeFromMug: function (mug) {
            return this.getNodeFromValue(mug);
        },
        getMugFromUFID: function (ufid) {
            var node = this.getNodeFromValue(function (value) {
                return value && value.ufid === ufid;
            });
            
            return node ? node.getValue() : null;
        },
        removeChild: function (node) {
            var childIdx = this.children.indexOf(node);
            if (childIdx !== -1) { //if arg node is a member of the children list
                this.children.splice(childIdx, 1); //remove it
            }

            return node;
        },
        /**
         * Finds the parentNode of the specified node (recursively going through the tree/children of this node)
         * Returns the parent if found, else null.
         */
        findParentNode: function (node) {
            var i, parent = null;
            if (!this.children || this.children.length === 0) {
                return null;
            }
            if (this.children.indexOf(node) !== -1) {
                return this;
            }

            for (i in this.children) {
                if (this.children.hasOwnProperty(i)) {
                    parent = this.children[i].findParentNode(node);
                    if (parent !== null) {
                        return parent;
                    }
                }
            }
            return parent;
        },
        /**
         * An ID used during prettyPrinting of the Node. (a human readable value for the node)
         */
        getID: function () {
            var id;
            if (this.isRootNode) {
                return this.rootNodeId;
            }
            return this.getValue().getNodeID();
        },
        /**
         * Get all children MUG TYPES of this node (not recursive, only the top level).
         * Return a list of Mug objects, or empty list for no children.
         */
        getChildrenMugs: function () {
            var i, retList = [];
            for (i in this.children) {
                if (this.children.hasOwnProperty(i)) {
                    retList.push(this.children[i].getValue());
                }
            }
            return retList;
        },
        getStructure: function () {
            var ret = {};
            ret[this.getID()] = _.map(this.children, function (c) {
                return c.getStructure();
            });
            return ret;
        },
        /**
         * calls the given function on each node (the node
         * is given as the only argument to the given function)
         * and appends the result (if any) to a flat list
         * (the store argument) which is then returned
         * @param nodeFunc
         * @param store
         */
        treeMap: function (nodeFunc, store, afterChildFunc) {
            var result, child;
            result = nodeFunc(this); //call on self
            if(result){
                store.push(result);
            }
            for(child in this.getChildren()){
                if(this.getChildren().hasOwnProperty(child)){
                    this.getChildren()[child].treeMap(nodeFunc, store, afterChildFunc); //have each children also perform the func
                }
            }
            if(afterChildFunc){
                afterChildFunc(this, result);
            }
            return store; //return the results
        },
        /**
         * See docs @ Tree.validateTree()
         */
        validateTree: function () {
            var validationErrors, thisMug, i, childResult;
            if(!this.getValue()){
                throw 'Tree contains node with no values!';
            }
            if (!this.getValue().isValid()) {
                return false;
            }

            for (i in this.getChildren()) {
                if (this.getChildren().hasOwnProperty(i)) {
                    childResult = this.getChildren()[i].validateTree();
                    if(!childResult){
                        return false;
                    }
                }
            }

            //If we got this far, everything checks out.
            return true;
        }
    };

    /**
     * A regular tree (with any amount of leafs per node)
     * @param treeType - is this a DataElement tree or a controlElement tree (use
     * 'data' or 'control' for this argument, respectively)
     */
    function Tree(rootId, treeType) {
        util.eventuality(this);

        this.rootNode = new Node(null, null);
        this.rootNode.isRootNode = true;
        this.setRootID(rootId);
        this.treeType = treeType || 'data';
    }

    Tree.prototype = {
        setRootID: function (id) {
            this.rootNode.rootNodeId = id;
        },
        getParentNode: function (node) {
            if (this.rootNode === node) { //special case:
                return this.rootNode;
            } else { //regular case
                return this.rootNode.findParentNode(node);
            }
        },
        getStructure: function () {
            return this.rootNode.getStructure();
        },
        /**
         * Given a mug, finds the node that the mug belongs to (in this tree).
         * Will return null if nothing is found.
         */
        getNodeFromMug: function (mug) {
            return this.rootNode.getNodeFromMug(mug);
        },
        /**
         * Removes a node (and all it's children) from the tree (regardless of where it is located in the
         * tree) and returns it.
         *
         * If no such node is found in the tree (or node is null/undefined)
         * null is returned.
         */
        _removeNodeFromTree: function (node) {
            if (!node) {
                return null;
            }
            if (!this.getNodeFromMug(node.getValue())) {
                return null;
            } //node not in tree
            var parent = this.getParentNode(node);
            if (parent) {
                parent.removeChild(node);
                this.fire({
                    type: 'change'
                });
                return node;
            } else {
                return null;
            }
        },
        /**
         * Insert a Mug as a child to the node containing parentMug.
         *
         * Will MOVE the mug to the new location in the tree if it is already present!
         * @param mug - the Mug to be inserted into the Tree
         * @param position - position relative to the refMug. Can be 'null', 'before', 'after' or 'into'
         * @param refMug - reference Mug.
         *
         * if refMug is null, will default to the last child of the root node.
         * if position is null, will default to 'after'.  If 'into' is specified, mug will be inserted
         * as a ('after') child of the refMug.
         *
         * If an invalid move is specified, no operation will occur.
         */
        insertMug: function (mug, position, refMug) {
            var refNode = refMug ? this.getNodeFromMug(refMug) : this.rootNode,
                refNodeSiblings, refNodeIndex, refNodeParent, node;

            //remove it from tree if it already exists
            node = this._removeNodeFromTree(this.getNodeFromMug(mug)); 
            if (!node) {
                node = new Node(null, mug);
            }

            refNodeParent = this.getParentNode(refNode);
            refNodeSiblings = refNodeParent.getChildren();
            refNodeIndex = refNodeSiblings.indexOf(refNode);

            if (['into', 'first', 'last'].indexOf(position) !== -1) {
                mug.parentMug = refMug;
            } else {
                mug.parentMug = refNodeParent.getValue();
            }

            switch (position) {
                case 'before':
                    refNodeParent.insertChild(node, refNodeIndex);
                break;
                case 'after':
                    refNodeParent.insertChild(node, refNodeIndex + 1);
                break;
                case 'into':
                    refNode.addChild(node);
                break;
                case 'first':
                    refNode.insertChild(node, 0);
                break;
                case 'last':
                    refNode.insertChild(node, refNodeSiblings.length + 1);
                break;
                default:
                    throw "in insertMug() position argument MUST be null, 'before', 'after', 'into', 'first' or 'last'.  Argument was: " + position;
            }
            this.fire({
                type: 'change',
                mug: mug
            });
        },
        /**
         * returns the absolute path, in the form of a string separated by slashes ('/nodeID/otherNodeID/finalNodeID'),
         * the nodeID's are those given by the Mugs (i.e. the node value objects) according to whether this tree is a
         * 'data' (DataElement) tree or a 'bind' (BindElement) tree.
         *
         * @param nodeOrmug - can be a tree Node or a mug that is a member of this tree (via a Node)
         */
        getAbsolutePath: function (mug) {
            var node = this.getNodeFromMug(mug),
                output, nodeParent;
            if (!node) {
                // todo: throw exception instead
                //                console.log('Cant find path of Mug that is not present in the Tree!');
                return null;
            }
            nodeParent = this.getParentNode(node);
            output = '/' + node.getID();

            while (nodeParent) {
                output = '/' + nodeParent.getID() + output;
                if (nodeParent.isRootNode) {
                    break;
                }
                nodeParent = this.getParentNode(nodeParent);

            }

            return output;
        },
        /**
         * Removes the specified Mug from the tree. If it isn't in the tree
         * does nothing.  Does nothing if null is specified
         *
         * If the Mug is successfully removed, returns that Mug.
         */
        removeMug: function (mug) {
            var node = this.getNodeFromMug(mug);
            if (!mug || !node) {
                return;
            }
            this._removeNodeFromTree(node);
            return node;
        },
        /**
         * Given a UFID searches through the tree for the corresponding Mug and returns it.
         * @param ufid of a mug
         */
        getMugFromUFID: function (ufid) {
            return this.rootNode.getMugFromUFID(ufid);
        },

        /**
         * Returns all the children Mugs (as a list) of the
         * root node in the tree.
         */
        getRootChildren: function () {
            return this.rootNode.getChildrenMugs();
        },
        /**
         * Performs the given func on each
         * node of the tree (the Node is given as the only argument to the function)
         * and returns the result as a list.
         * @param func - a function called on each node, the node is the only argument
         * @param afterChildFunc - a function called after the above function is called on each child of the current node.
         */
        treeMap: function (func, afterChildFunc) {
            return this.rootNode.treeMap(func, [], afterChildFunc);
        },
        isTreeValid: function() {
            var rChildren = this.rootNode.getChildren(),
            i, retVal;
            for (i in rChildren){
                if(rChildren.hasOwnProperty(i)){
                    retVal = rChildren[i].validateTree();
                    if(!retVal){
                        return false;
                    }
                }
            }
            return true;
        },
        getRootNode: function () {
            return this.rootNode;
        }
    };

    return Tree;
});
