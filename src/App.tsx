import { useState, useEffect, useRef, FormEvent } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Edit3, 
  X, 
  Save, 
  AlertCircle,
  Filter,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Tehtävän tietomalli
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

type FilterType = 'kaikki' | 'aktiiviset' | 'valmiit';

export default function App() {
  // Tilanhallinta
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [filter, setFilter] = useState<FilterType>('kaikki');
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Lataa tehtävät localStorage-muistista käynnistyksessä
  useEffect(() => {
    const savedTodos = localStorage.getItem('pwa_todo_list');
    if (savedTodos) {
      try {
        setTodos(JSON.parse(savedTodos));
      } catch (e) {
        console.error('Virhe ladattaessa tehtäviä:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Tallenna tehtävät localStorage-muistiin aina kun ne muuttuvat
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('pwa_todo_list', JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

  // Validoi syöte
  const validateInput = (text: string): string | null => {
    const trimmed = text.trim();
    if (!trimmed) return 'Tehtävä ei voi olla tyhjä.';
    if (trimmed.length > 100) return 'Tehtävä on liian pitkä (max 100 merkkiä).';
    return null;
  };

  // Lisää uusi tehtävä
  const addTodo = (e?: FormEvent) => {
    if (e) e.preventDefault();
    
    const validationError = validateInput(inputValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    setTodos([newTodo, ...todos]);
    setInputValue('');
    setError(null);
  };

  // Poista tehtävä
  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
    setConfirmDelete(null);
  };

  // Vaihda tehtävän tila (tehty/tekemättä)
  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  // Aloita muokkaus
  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
    setError(null);
  };

  // Tallenna muokkaus
  const saveEdit = () => {
    const validationError = validateInput(editText);
    if (validationError) {
      setError(validationError);
      return;
    }

    setTodos(todos.map(t => 
      t.id === editingId ? { ...t, text: editText.trim() } : t
    ));
    setEditingId(null);
    setError(null);
  };

  // Suodatetut tehtävät
  const filteredTodos = todos.filter(t => {
    if (filter === 'aktiiviset') return !t.completed;
    if (filter === 'valmiit') return t.completed;
    return true;
  });

  // Tilastot
  const activeCount = todos.filter(t => !t.completed).length;

  return (
    <div className="min-h-full flex flex-col max-w-md mx-auto bg-white shadow-xl overflow-hidden relative">
      {/* Otsikko */}
      <header className="bg-blue-600 p-6 text-white shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">Tehtävälista</h1>
        <p className="text-blue-100 text-sm mt-1">
          {activeCount === 0 
            ? 'Kaikki tehtävät hoidettu!' 
            : `${activeCount} tehtävää jäljellä`}
        </p>
      </header>

      {/* Syöttökenttä */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <form onSubmit={addTodo} className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Mitä pitäisi tehdä?"
            className="w-full pl-4 pr-12 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
            aria-label="Uusi tehtävä"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md"
            aria-label="Lisää tehtävä"
          >
            <Plus size={24} />
          </button>
        </form>
        
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 flex items-center gap-2 text-red-600 text-sm font-medium px-2"
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Suodattimet */}
      <div className="flex p-2 gap-1 bg-slate-50 border-b border-slate-100">
        {(['kaikki', 'aktiiviset', 'valmiit'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold capitalize transition-all ${
              filter === f 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-200/50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Tehtävälista */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTodos.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-slate-400"
            >
              <Filter size={48} strokeWidth={1} className="mb-4 opacity-20" />
              <p>Ei tehtäviä tässä näkymässä.</p>
            </motion.div>
          ) : (
            filteredTodos.map((todo) => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group relative bg-white border rounded-2xl p-4 flex items-center gap-3 shadow-sm transition-all ${
                  todo.completed ? 'border-slate-100 bg-slate-50/50' : 'border-slate-200'
                }`}
              >
                {/* Tila-painike */}
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`flex-shrink-0 transition-colors ${
                    todo.completed ? 'text-green-500' : 'text-slate-300 hover:text-blue-400'
                  }`}
                  aria-label={todo.completed ? "Merkitse tekemättömäksi" : "Merkitse tehdyksi"}
                >
                  {todo.completed ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                </button>

                {/* Teksti tai muokkauskenttä */}
                <div className="flex-1 min-w-0">
                  {editingId === todo.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                        className="w-full py-1 border-b-2 border-blue-500 focus:outline-none text-lg"
                      />
                      <button onClick={saveEdit} className="text-blue-600 p-1" aria-label="Tallenna">
                        <Save size={20} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-slate-400 p-1" aria-label="Peruuta">
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <p className={`text-lg truncate transition-all ${
                      todo.completed ? 'text-slate-400 line-through' : 'text-slate-800'
                    }`}>
                      {todo.text}
                    </p>
                  )}
                </div>

                {/* Toiminnot */}
                {!editingId && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEditing(todo)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      aria-label="Muokkaa"
                    >
                      <Edit3 size={20} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(todo.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      aria-label="Poista"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                )}
                
                {/* Mobiili-indikaattori (nuoli) */}
                <div className="md:hidden text-slate-200 group-hover:hidden">
                  <ChevronRight size={20} />
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </main>

      {/* Poiston vahvistus -modali */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Poistetaanko?</h3>
              <p className="text-slate-500 mb-6">Tätä toimintoa ei voi perua.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Peruuta
                </button>
                <button
                  onClick={() => deleteTodo(confirmDelete)}
                  className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                >
                  Poista
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline-ilmoitus */}
      <OfflineIndicator />
    </div>
  );
}

function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="absolute bottom-4 left-4 right-4 bg-slate-800 text-white px-4 py-3 rounded-2xl flex items-center gap-3 shadow-lg z-40"
        >
          <AlertCircle size={20} className="text-amber-400" />
          <div className="text-sm">
            <p className="font-bold">Olet offline-tilassa</p>
            <p className="opacity-80">Sovellus toimii rajoitetusti.</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
