import React, { useState } from "react";

const TreeNode = ({
  node,
  selectedNodes,
  handleNodeSelect,
  handleNodeDeselect,
  handleNodeAdd,
  handleNodeReset,
  handleNodeOptionChange,
  data,
  setData,
  arguments_,
}) => {
  const handleOptionChange = (event) => {
    const selectedOption = event.target.value;
    if (selectedOption === "and" || selectedOption === "or") {
      handleNodeAdd(node.id, selectedOption);
    } else {
      handleNodeOptionChange(node.id, selectedOption);
    }
  };

  const handleAddNodeToCurrentNode = (nodeId, selectedOption) => {
    const newNode = {
      id: Date.now(),
      value: selectedOption || "",
      children: [],
    };

    setData((prevData) => {
      return recursiveAddNode([...prevData], nodeId, newNode);
    });
  };

  const recursiveAddNode = (nodes, parentId, newNode) => {
    return nodes.map((node) => {
      if (node.id === parentId) {
        if (node.children) {
          return {
            ...node,
            children: [...node.children, newNode],
          };
        } else {
          return {
            ...node,
            children: [newNode],
          };
        }
      } else if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: recursiveAddNode(node.children, parentId, newNode),
        };
      }
      return node;
    });
  };
  const handleReset = () => {
    handleNodeReset(node.id);
  };

  return (
    <div>
      <div>
        <select
          /* defaultValue={node.value} */
          defaultValue={
            node.value === "constant" ? node.value : node.value || ""
          }
          onChange={handleOptionChange}
        >
          {node.type === "constant" ? (
            <>
              <option value="constant">Select value</option>
              <option value={true}>true</option>
              <option value={false}>false</option>
            </>
          ) : node.type === "argument" ? (
            <>
              {arguments_.map((val) => (
                <option value={val.name}>{val.name}</option>
              ))}
            </>
          ) : (
            <>
              <option value="">Select</option>
              <option value="constant">Constant</option>
              <option value="argument">Argument</option>
              <option value="and">AND</option>
              <option value="or">OR</option>
            </>
          )}
        </select>
        <button onClick={handleReset}>×</button>
        <button
          onClick={() => {
            handleAddNodeToCurrentNode(node.id, "");
          }}
        >
          +
        </button>
      </div>
      {node.children && node.children.length > 0 && (
        <ul>
          {node.children.map((childNode) => (
            <li key={childNode.id}>
              <TreeNode
                node={childNode}
                selectedNodes={selectedNodes}
                handleNodeSelect={handleNodeSelect}
                handleNodeDeselect={handleNodeDeselect}
                handleNodeAdd={handleNodeAdd}
                handleNodeReset={handleNodeReset}
                handleNodeOptionChange={handleNodeOptionChange}
                data={data}
                setData={setData}
                arguments_={arguments_}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const SelectSystem = () => {
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [arguments_, setArguments] = React.useState([
    { name: "", value: true },
  ]);
  const [data, setData] = useState([
    {
      id: 1,
      value: "",
      children: [],
      type: null,
    },
  ]);
  const [originalData, setOriginalData] = useState(data);

  const handleNodeSelect = (nodeId) => {
    setSelectedNodes((prevSelectedNodes) => [...prevSelectedNodes, nodeId]);
  };

  const handleNodeDeselect = (nodeId) => {
    setSelectedNodes((prevSelectedNodes) =>
      prevSelectedNodes.filter((selectedNodeId) => selectedNodeId !== nodeId)
    );
  };

  const handleNodeAdd = (nodeId, selectedOption) => {
    const newNode = {
      id: Date.now(),
      value: selectedOption || "",
      children: [],
    };

    if (selectedOption === "and" || selectedOption === "or") {
      const childNode1 = createPlaceholderNode();
      const childNode2 = createPlaceholderNode();
      newNode.children.push(childNode1, childNode2);
    } else {
      // handleAddNodeToCurrent(nodeId);
    }

    setData((prevData) => {
      return recursiveAddNode([...prevData], nodeId, newNode);
    });
  };

  const recursiveAddNode = (nodes, parentId, newNode) => {
    return nodes.map((node) => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...newNode.children],
        };
      } else if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: recursiveAddNode(node.children, parentId, newNode),
        };
      }
      return node;
    });
  };

  const handleNodeReset = (nodeId) => {
    setData((prevData) => {
      return recursiveResetNode([...prevData], nodeId);
    });
  };

  const recursiveResetNode = (nodes, nodeId) => {
    return nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          value: originalData.find((n) => n.id === nodeId)?.value || "",
          type: originalData.find((n) => n.id === nodeId)?.type || null,
          children: [],
        };
      } else if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: recursiveResetNode(node.children, nodeId),
        };
      }
      return node;
    });
  };

  const createPlaceholderNode = () => {
    return {
      id: Date.now() + Math.random(),
      value: "",
      children: [],
    };
  };

  const recursiveUpdateNodeValue = (nodes, nodeId, value, type) => {
    let selectedType = type;
    if (
      value === "and" ||
      value === "or" ||
      value === "argument" ||
      value === "constant"
    ) {
      selectedType = value;
    } else {
      selectedType = null;
    }

    return nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          value: value,
          type: selectedType ? selectedType : node.type,
        };
      } else if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: recursiveUpdateNodeValue(
            node.children,
            nodeId,
            value,
            type
          ),
        };
      }
      return node;
    });
  };

  const resetNodeValues = () => {
    setData(originalData);
  };

  const handleNodeOptionChange = (nodeId, selectedOption) => {
    const value = selectedOption;
    setData((prevData) => {
      return recursiveUpdateNodeValue([...prevData], nodeId, value);
    });
  };

  const handleReset = () => {
    resetNodeValues();
    setSelectedNodes([]);
  };
  const calculateValue = (node) => {
    if (node.type === "argument") {
      const argument = arguments_.find((arg) => arg.name === node.value);
      return argument.value;
    } else if (node.type === "constant") {
      return node.value;
    } else if (node.type === "and") {
      return (
        calculateValue(node.children[0]) && calculateValue(node.children[1])
      );
    } else if (node.type === "or") {
      return (
        calculateValue(node.children[0]) || calculateValue(node.children[1])
      );
    }
    return false;
  };
  const calculateFinalValue = () => {
    return calculateValue(data[0]);
  };
  return (
    <div>
      {arguments_.map((argument, index) => (
        <div key={index}>
          <input
            value={argument.name}
            onChange={(e) => {
              const newArguments = [...arguments_];
              newArguments[index].name = e.target.value;
              setArguments(newArguments);
            }}
          />
          <select
            onChange={(e) => {
              const newArguments = [...arguments_];
              newArguments[index].value = e.target.value;
              setArguments(newArguments);
            }}
            value={argument.value}
          >
            <option value={true}>true</option>
            <option value={false}>false</option>
          </select>
          <button
            onClick={() => {
              const newArguments = [...arguments_];
              newArguments.splice(index, 1);
              setArguments(newArguments);
            }}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        onClick={() =>
          setArguments([
            ...arguments_,
            {
              name: "",
              value: true,
            },
          ])
        }
      >
        + add arg
      </button>
      {data.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          selectedNodes={selectedNodes}
          handleNodeSelect={handleNodeSelect}
          handleNodeDeselect={handleNodeDeselect}
          handleNodeAdd={handleNodeAdd}
          handleNodeReset={handleNodeReset}
          handleNodeOptionChange={handleNodeOptionChange}
          data={data}
          setData={setData}
          arguments_={arguments_}
        />
      ))}

      <h2>Result</h2>
      <div>
        <div>{calculateFinalValue() ? "true" : "false"}</div>
      </div>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
};

export default SelectSystem;
