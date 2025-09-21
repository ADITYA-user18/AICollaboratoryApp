// screens/project.jsx

import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "../config/axios";
import { useLocation } from "react-router-dom";
import {
  initiateSocketConnection,
  sendMessage,
  receiveMessage,
} from "../config/socket";
import { UserContext } from "../context/user.context";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { getWebContainerInstance } from "../config/WebContainer";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

// --- UI STATE COMPONENTS ---
const ThinkingIndicator = () => (
  <div className="flex items-center space-x-2 text-gray-400">
    <span>Generating response</span>
    <div className="flex items-center space-x-1 p-1">
      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
    </div>
  </div>
);
const BlinkingCursor = () => (
  <span className="inline-block w-2 h-4 bg-gray-300 animate-pulse ml-1" />
);

// --- MAIN PROJECT COMPONENT ---
const Project = () => {
  const location = useLocation();
  const { user } = useContext(UserContext);

  // --- STATE MANAGEMENT ---
  const [SidePanelOpen, setSidePanelOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [addedPartners, setAddedPartners] = useState([]);
  const [project, setProject] = useState(null);
  const [Message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [fileTree, setFileTree] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setopenFiles] = useState([]);
  const [webContainer, setWebContainer] = useState(null);
  const [highlightedCode, setHighlightedCode] = useState("");
  const preRef = useRef(null);
  const textareaRef = useRef(null);
  const [languageId, setLanguageId] = useState("python");
  const [sourceCode, setSourceCode] = useState("");
  const [compilerOutput, setCompilerOutput] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [isCompilerVisible, setIsCompilerVisible] = useState(false);
  const [compilerStatus, setCompilerStatus] = useState("idle");

  // ✅ FIX: Use a ref to keep track of the latest fileTree to avoid stale closures
  const fileTreeRef = useRef(fileTree);
  useEffect(() => {
    fileTreeRef.current = fileTree;
  }, [fileTree]);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // --- LIFECYCLE & DATA HANDLING ---
  useEffect(() => {
    const init = async () => { if (!webContainer) { try { const instance = await getWebContainerInstance(); setWebContainer(instance); } catch (err) { console.error("Error creating WebContainer instance:", err); } } };
    init();
  }, [webContainer]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const content = fileTree[currentFile]?.content;
    if (typeof content === "string") {
      const language = currentFile.split(".").pop();
      let highlighted;
      if (language && hljs.getLanguage(language)) { highlighted = hljs.highlight(content, { language }).value; } else { highlighted = hljs.highlightAuto(content).value; }
      setHighlightedCode(highlighted);
    } else {
      setHighlightedCode("");
    }
  }, [fileTree, currentFile]);

  useEffect(() => {
    const projectId = location.state?.project?._id;
    if (!projectId) return;

    const socket = initiateSocketConnection(projectId);
    
    const handleProjectMessage = (data) => {
        setMessages((prev) => {
            const messageExists = prev.some(msg => msg._id === data._id);
            if (messageExists) {
                return prev.map(msg => msg._id === data._id ? data : msg);
            } else {
                return [...prev, data];
            }
        });
    };
    const handleAiChunk = (data) => setMessages((prev) => prev.map((msg) => msg._id === data._id ? { ...msg, Message: (msg.Message || "") + data.chunk, isLoading: false, isStreaming: true } : msg));
    const handleAiError = (data) => setMessages((prev) => prev.map((msg) => msg._id === data._id ? { ...data, isLoading: false, isStreaming: false } : msg));
    
    const handleAiEnd = (data) => {
        setMessages((prev) => prev.map((msg) => {
            if (msg._id === data._id) {
                const finalMsg = { ...msg, isLoading: false, isStreaming: false, timestamp: data.timestamp };
                
                try {
                    const parsed = JSON.parse(finalMsg.Message);
                    
                    if (parsed && typeof parsed === "object" && parsed.fileTree) {
                        const newOrModifiedFiles = parsed.fileTree;
                        // ✅ FIX: Use the ref here to get the most up-to-date fileTree state
                        setFileTree({
                            ...fileTreeRef.current,
                            ...newOrModifiedFiles
                        });

                        const newFileNames = Object.keys(newOrModifiedFiles);
                        setopenFiles(prevOpenFiles => [...new Set([...prevOpenFiles, ...newFileNames])]);
                        
                        if (newFileNames.length > 0) {
                            setCurrentFile(newFileNames[0]);
                        }
                        
                        return { ...finalMsg, Message: parsed.text || "I've updated the files for you." };
                    }
                } catch (e) {
                    console.log("AI response was conversational text.");
                }
                
                return finalMsg;
            }
            return msg;
        }));
    };
    
    const handleFilesUpdated = (newFileTree) => setFileTree(newFileTree);

    receiveMessage("project-message", handleProjectMessage);
    receiveMessage("ai-message-chunk", handleAiChunk);
    receiveMessage("ai-message-end", handleAiEnd);
    receiveMessage("ai-message-error", handleAiError);
    receiveMessage("files-updated", handleFilesUpdated);

    const fetchData = async () => {
      try {
        const projectRes = await axios.get(`/projects/get-project/${projectId}`);
        const fetchedProject = projectRes.data.project;
        setProject(fetchedProject);
        if (fetchedProject.users) setAddedPartners(fetchedProject.users);
        if (fetchedProject.messages) setMessages(fetchedProject.messages);
        if (fetchedProject.fileTree && Object.keys(fetchedProject.fileTree).length > 0) {
            setFileTree(fetchedProject.fileTree);
            const savedFiles = Object.keys(fetchedProject.fileTree);
            setopenFiles(savedFiles);
            setCurrentFile(savedFiles[0]);
        }
        const usersRes = await axios.get("/users/all");
        setUsers(usersRes.data.users);
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
      }
    };
    fetchData();

    return () => {
      socket.off("project-message", handleProjectMessage);
      socket.off("ai-message-chunk", handleAiChunk);
      socket.off("ai-message-end", handleAiEnd);
      socket.off("ai-message-error", handleAiError);
      socket.off("files-updated", handleFilesUpdated);
    };
  }, [location.state?.project?._id]);

  useEffect(() => {
    const debounceSave = setTimeout(() => {
      if (project?._id && fileTree) {
        sendMessage('update-files', { projectId: project._id, fileTree });
      }
    }, 1500);
    return () => clearTimeout(debounceSave);
  }, [fileTree, project]);

  useEffect(() => {
    if (!currentFile) return;
    const extensionToLanguageMap = { cpp: "cpp", c: "c", java: "java", py: "python", js: "javascript" };
    const fileExtension = currentFile.split(".").pop();
    const language = extensionToLanguageMap[fileExtension];
    if (language) setLanguageId(language);
  }, [currentFile]);

  // --- HANDLER FUNCTIONS ---
  const handleDeleteFile = (e, fileToDelete) => {
    e.stopPropagation();
    const newFileTree = { ...fileTree };
    delete newFileTree[fileToDelete];
    setFileTree(newFileTree);
    const newOpenFiles = openFiles.filter(f => f !== fileToDelete);
    setopenFiles(newOpenFiles);
    if (currentFile === fileToDelete) {
      setCurrentFile(newOpenFiles[0] || null);
    }
  };
  
  const handleAddPartner = async () => {
    if (!selectedUserId || !project?._id) return;
    try {
        const res = await axios.put("/projects/add-user", { projectId: project._id, users: [selectedUserId] });
        if (res.data.project && res.data.project.users) { setAddedPartners(res.data.project.users); }
        setSelectedUserId(null); setModalOpen(false);
    } catch (err) { console.error("Error adding partner:", err); }
  };

  const handleRemovePartner = async (partnerId) => {
    if (!project?._id) return;
    try {
        const res = await axios.put("/projects/remove-user", { projectId: project._id, userId: partnerId });
        if (res.data.project && res.data.project.users) { setAddedPartners(res.data.project.users); }
    } catch (err) { console.error("Error removing partner:", err); }
  };
  
  const handleRunClick = () => { if (currentFile && fileTree[currentFile]) { setSourceCode(fileTree[currentFile].content); } setCompilerStatus("idle"); setCompilerOutput(""); setIsCompilerVisible(true); };
  const handleRunCode = async () => { if (!sourceCode.trim()) { setCompilerOutput("Please enter some code to run."); setCompilerStatus("error"); return; } setIsCompiling(true); setCompilerStatus("running"); setCompilerOutput("Running code..."); try { const response = await axios.post("/api/code/run", { source_code: sourceCode, language: languageId, stdin: "" }); const { stdout, stderr, compile_output, message, status } = response.data; if (status.id === 6) { setCompilerOutput(compile_output || stderr || "Compilation Error"); setCompilerStatus("error"); } else if (status.id !== 3) { setCompilerOutput(stderr || message || `Error: ${status.description}`); setCompilerStatus("error"); } else { setCompilerOutput(stdout || "Execution successful, but no output."); setCompilerStatus("success"); } } catch (error) { const errorMessage = error.response?.data?.error || "An unexpected error occurred."; setCompilerOutput(errorMessage); setCompilerStatus("error"); } finally { setIsCompiling(false); } };
  
  const send = () => { 
    if (!user || !Message?.trim() || !project) return; 
    sendMessage("project-message", { 
        Message, 
        sender: user, 
        projectId: project._id,
        fileTree: fileTreeRef.current // ✅ FIX: Send the most up-to-date fileTree from the ref
    }); 
    setMessage(""); 
  };
  
  const markdownComponents = { code({ node, inline, className, children, ...props }) { const match = /language-(\w+)/.exec(className || ""); return !inline && match ? ( <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>{String(children).replace(/\n$/, "")}</SyntaxHighlighter> ) : ( <code className="text-pink-500 bg-gray-800/50 rounded px-1.5 py-1 font-mono text-sm" {...props}>{children}</code> ); }, };

  return (
    <main className="h-screen w-screen flex bg-gray-900 text-gray-300 font-sans overflow-hidden">
        <section className="w-full md:w-2/5 lg:w-[30%] h-full flex flex-col relative flex-shrink-0 border-r border-gray-700">
            <header className="flex justify-between items-center p-4 w-full bg-gray-800 shadow-md flex-shrink-0 z-20 border-b border-gray-700">
                <button className="flex gap-2 items-center cursor-pointer bg-blue-600 p-2 px-4 hover:bg-blue-700 rounded-lg text-white font-semibold transition" onClick={() => setModalOpen(true)}><i className="ri-user-add-line text-lg"></i><p className="hidden sm:block">Add Partner</p></button>
                <h1 className="text-white text-lg font-bold mx-4 truncate">{project?.name || "Project Chat"}</h1>
                <button onClick={() => setSidePanelOpen(!SidePanelOpen)} className="cursor-pointer text-gray-300 text-2xl hover:text-white transition"><i className="ri-group-fill"></i></button>
            </header>
            <div className="flex-1 flex flex-col overflow-hidden relative">
                <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
                    {messages.map((msg, idx) => {
                        if (!msg || !msg.sender) { return null; }
                        const isAI = msg.sender.isAI === true || msg.isAIMessage === true;
                        const isSender = !isAI && msg.sender._id === user?._id;

                        return (
                            <div key={msg._id || idx} className={`flex mb-1 ${isSender ? "justify-end" : "justify-start"}`}>
                                <div className={`group relative flex flex-col p-3 rounded-xl max-w-[85%] break-words shadow-md ${isSender ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-700 text-gray-200 rounded-bl-none"} ${isAI ? "bg-gray-800 border border-indigo-500/50" : ""}`}>
                                    {!isSender && (<small className={`text-xs mb-1 font-semibold ${isAI ? "text-indigo-400" : "text-gray-400"}`}>{isAI ? "AI Assistant" : msg.sender.email}</small>)}
                                    {msg.isLoading ? <ThinkingIndicator /> : (
                                        <>
                                            <div className="prose prose-sm max-w-none text-inherit prose-p:text-inherit prose-strong:text-inherit">
                                                <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{msg.Message}</ReactMarkdown>
                                                {msg.isStreaming && <BlinkingCursor />}
                                            </div>
                                            <div className="flex justify-end items-end mt-1">
                                                <span className={`text-xs ${isSender ? 'text-blue-200' : 'text-gray-500'}`}>{formatTime(msg.timestamp)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
                <div className="flex items-center p-3 bg-gray-800 flex-shrink-0 shadow-inner border-t border-gray-700">
                    <input type="text" value={Message} onChange={(e) => setMessage(e.target.value)} onKeyPress={(e) => e.key === "Enter" && send()} placeholder="Type your prompt here..." className="flex-1 p-3 rounded-xl border border-gray-600 bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400" />
                    <button onClick={send} disabled={!Message?.trim()} className="ml-3 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition"><i className="ri-send-plane-fill text-lg"></i></button>
                </div>
            </div>
            <div className={`absolute top-0 left-0 w-full sm:w-80 md:w-96 h-full bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out z-40 ${SidePanelOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <header className="flex justify-between items-center p-4 bg-gray-900 shadow-md">
                    <h2 className="text-xl font-bold text-white">Project Partners</h2>
                    <button onClick={() => setSidePanelOpen(false)} className="text-gray-400 text-2xl hover:text-white transition"><i className="ri-close-fill"></i></button>
                </header>
                <div className="flex flex-col gap-3 p-4 overflow-y-auto h-[calc(100%-68px)]">
                    {addedPartners.length === 0 ? <p className="text-gray-500 text-center mt-4">No partners added yet.</p> :
                    addedPartners.map((partner) => (
                        <div key={partner._id || partner.id} className="flex items-center gap-4 shadow-sm rounded-xl p-4 bg-gray-700 border border-gray-600">
                            <div className="flex-shrink-0 items-center justify-center text-white bg-blue-600 w-10 h-10 rounded-full text-xl flex"><i className="ri-user-fill"></i></div>
                            <div className="flex-grow truncate"><h1 className="text-gray-200 font-semibold truncate">{partner.email || "No email"}</h1></div>
                            <button onClick={() => handleRemovePartner(partner._id || partner.id)} className="ml-auto text-gray-500 hover:text-red-500 text-xl flex-shrink-0 transition" title="Remove"><i className="ri-delete-bin-line"></i></button>
                        </div>
                    ))}
                </div>
            </div>
            {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md p-6 flex flex-col gap-5 shadow-lg">
                    <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-3">
                        <h2 className="font-bold text-2xl text-gray-100">Add Partner</h2>
                        <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-200 transition"><i className="ri-close-line text-2xl"></i></button>
                    </div>
                    <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-2">
                        {users.map((u) => {
                        const userId = u._id || u.id; const isAdded = addedPartners.some((p) => (p._id || p.id) === userId);
                        return (
                            <button key={userId} onClick={() => !isAdded && setSelectedUserId(userId)} disabled={isAdded}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 w-full text-left transition ${selectedUserId === userId ? "border-blue-500 bg-blue-900/20" : "border-gray-700"} ${isAdded ? "bg-gray-700/50 text-gray-500 cursor-not-allowed opacity-70" : "hover:bg-gray-700"}`}>
                            <div className="w-10 h-10 rounded-full bg-gray-600 text-white flex items-center justify-center flex-shrink-0"><i className="ri-user-3-fill text-lg"></i></div>
                            <div className="flex-grow truncate"><span className="font-medium text-gray-200 truncate">{u.name || u.email || "Unknown"}</span><small className="text-gray-400 truncate block">{u.email || "No email"}</small></div>
                            {isAdded && <span className="text-green-500 text-sm font-semibold ml-2">Added</span>}
                            </button>
                        );})}
                    </div>
                    <button onClick={handleAddPartner} disabled={!selectedUserId} className={`mt-4 w-full px-5 py-3 rounded-xl text-white font-semibold text-lg transition ${selectedUserId ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 cursor-not-allowed"}`}>Add Partner</button>
                </div>
            </div>
            )}
        </section>

        <section className="bg-gray-800 text-white flex-grow h-full flex flex-col overflow-hidden relative">
            {Object.keys(fileTree).length > 0 ? (
            <div className="flex-grow flex h-full overflow-hidden">
                <div className="explorer w-52 bg-gray-900 py-5 flex-shrink-0 h-full overflow-y-auto border-r border-gray-700">
                    <h3 className="px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Explorer</h3>
                    <div className="file-tree w-full flex gap-1 flex-col mx-auto px-2">
                        {Object.keys(fileTree).map((file) => (
                            <div key={file} className={`group flex items-center justify-between p-2 rounded-md w-full text-left text-gray-300 transition cursor-pointer ${currentFile === file ? "bg-blue-600/20 text-blue-300" : "hover:bg-gray-700/50"}`} onClick={() => { setCurrentFile(file); if (!openFiles.includes(file)) setopenFiles((prev) => [...prev, file]); }}>
                                <p className="truncate text-sm">{file}</p>
                                <button onClick={(e) => handleDeleteFile(e, file)} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity ml-2" title={`Delete ${file}`}><i className="ri-close-line"></i></button>
                            </div>
                        ))}
                    </div>
                </div>
                {currentFile && ( <div className="code-editor flex-1 flex flex-col h-full overflow-hidden">
                    <header className="top flex justify-between items-center flex-shrink-0 bg-gray-900 border-b border-gray-700">
                        <div className="flex overflow-x-auto">{openFiles.map((file) => (<button key={file} onClick={() => setCurrentFile(file)} className={`open-file flex-shrink-0 cursor-pointer px-4 py-2.5 border-b-2 text-sm transition ${currentFile === file ? "border-blue-500 bg-gray-800 text-white font-semibold" : "border-transparent text-gray-400 hover:bg-gray-700/50"}`}><p className="whitespace-nowrap">{file}</p></button>))}</div>
                        <button onClick={handleRunClick} className="flex-shrink-0 flex items-center gap-2 mr-4 px-4 py-1.5 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition"><i className="ri-play-fill text-lg"></i> Run</button>
                    </header>
                    <div className="bottom flex-1 flex flex-col relative overflow-hidden bg-[#1e1e1e]">
                        <textarea ref={textareaRef} value={fileTree[currentFile]?.content || ""} onChange={(e) => setFileTree((prev) => ({ ...prev, [currentFile]: { ...prev[currentFile], content: e.target.value } }))} onScroll={(e) => { if (preRef.current) { preRef.current.scrollTop = e.currentTarget.scrollTop; preRef.current.scrollLeft = e.currentTarget.scrollLeft; }}} className="absolute inset-0 w-full h-full p-4 text-base bg-transparent text-transparent caret-white outline-none resize-none overflow-auto font-mono z-10 leading-relaxed" spellCheck="false" />
                        <pre ref={preRef} className="absolute inset-0 w-full h-full p-4 text-base outline-none resize-none overflow-auto font-mono pointer-events-none leading-relaxed" aria-hidden="true"><code dangerouslySetInnerHTML={{ __html: highlightedCode }} /></pre>
                    </div>
                </div>)}
            </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-600">
                    <i className="ri-code-s-slash-line text-6xl"></i>
                    <p className="mt-4 text-lg">Your code will appear here.</p>
                    <p className="text-gray-500">Ask the AI to generate code to get started.</p>
                </div>
            )}
            <div className={`compiler-container absolute bottom-0 left-0 w-full h-[45vh] bg-gray-900 border-t-2 border-gray-700 shadow-2xl transform transition-transform duration-500 ease-in-out z-30 ${isCompilerVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="compiler-section p-4 flex flex-col gap-3 h-full">
                    <div className="flex justify-between items-center flex-shrink-0">
                    <h2 className="font-bold text-lg text-gray-300">Compiler & Output</h2>
                    <div className="flex items-center gap-4">
                        <select value={languageId} onChange={(e) => setLanguageId(e.target.value)} className="p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="cpp">C++</option><option value="c">C</option><option value="java">Java</option><option value="python">Python</option><option value="javascript">JavaScript</option>
                        </select>
                        <button onClick={() => setIsCompilerVisible(false)} className="text-gray-500 hover:text-white transition"><i className="ri-close-line text-2xl"></i></button>
                    </div>
                    </div>
                    <div className="flex gap-4 flex-grow overflow-hidden">
                    <textarea value={sourceCode} onChange={(e) => setSourceCode(e.target.value)} placeholder="Your code appears here. Click 'Run' to execute."
                        className="w-1/2 h-full p-3 font-mono border border-gray-700 rounded-md bg-gray-800 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" spellCheck="false" />
                    <div className="w-1/2 h-full flex flex-col">
                        <button onClick={handleRunCode} disabled={isCompiling || !sourceCode.trim()}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed mb-2 transition flex-shrink-0">
                        {isCompiling ? "Running..." : "Execute"}
                        </button>
                        <div className="flex-grow bg-black text-sm rounded-md font-mono whitespace-pre-wrap overflow-y-auto p-3">
                        <pre className={`${
                            compilerStatus === 'running' ? 'text-yellow-400' :
                            compilerStatus === 'error'   ? 'text-red-400'   :
                            'text-green-400'
                        }`}>
                            {compilerOutput || "Output will appear here..."}
                        </pre>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </section>
    </main>
  );
};

export default Project;
