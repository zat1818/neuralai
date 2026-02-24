import { useState, useEffect } from 'react';
import { Card, Button, Input, cn } from '../components/UI';
import { MessageSquare, ThumbsUp, MessageCircle, Plus, Search, Filter, X } from 'lucide-react';
import { api } from '../services/api';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { motion, AnimatePresence } from 'motion/react';
import { useSocket } from '../hooks/useSocket';

export const Forum = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Umum' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { socket } = useSocket();
  const token = localStorage.getItem('neural_token');

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const [postsData, leaderboardData] = await Promise.all([
          api.forum.getPosts(token) as Promise<any>,
          api.forum.getLeaderboard(token) as Promise<any>
        ]);
        setPosts(Array.isArray(postsData) ? postsData : []);
        setLeaderboard(Array.isArray(leaderboardData) ? leaderboardData : []);
      } catch (error) {
        console.error('Failed to fetch forum data', error);
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    if (!socket) return;

    socket.on('forum:post:new', (newPost) => {
      setPosts((prev) => [newPost, ...prev]);
    });

    socket.on('forum:post:like', ({ postId, likes }) => {
      setPosts((prev) => prev.map(p => p.id === postId ? { ...p, likes } : p));
    });

    socket.on('forum:post:comment', ({ postId, commentsCount }) => {
      setPosts((prev) => prev.map(p => p.id === postId ? { ...p, commentsCount } : p));
    });

    return () => {
      socket.off('forum:post:new');
      socket.off('forum:post:like');
      socket.off('forum:post:comment');
    };
  }, [socket]);

  const handleLike = async (postId: string) => {
    if (!token) return;
    try {
      await api.forum.likePost(token, postId);
      setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
    } catch (error) {
      console.error('Failed to like post', error);
    }
  };

  const handleCreatePost = async () => {
    if (!token || !newPost.title || !newPost.content) return;
    setIsSubmitting(true);
    try {
      const createdPost: any = await api.forum.createPost(token, newPost);
      setPosts([createdPost, ...posts]);
      setIsModalOpen(false);
      setNewPost({ title: '', content: '', category: 'Umum' });
    } catch (error) {
      console.error('Failed to create post', error);
      alert('Gagal membuat post. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-4 gap-8">
      {/* Sidebar */}
      <aside className="lg:col-span-1 space-y-6">
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="w-full py-4 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> POST BARU
        </Button>

        <Card className="space-y-4">
          <h3 className="font-orbitron text-xs text-neural-neon uppercase tracking-widest border-b border-neural-red/20 pb-2">Kategori</h3>
          <div className="space-y-1">
            <CategoryItem label="Umum" count={124} active />
            <CategoryItem label="Analisis Signal" count={86} />
            <CategoryItem label="Diskusi Berita" count={42} />
            <CategoryItem label="Tips AI" count={31} />
            <CategoryItem label="Chart Share" count={55} />
          </div>
        </Card>

        <Card className="space-y-4">
          <h3 className="font-orbitron text-xs text-neural-neon uppercase tracking-widest border-b border-neural-red/20 pb-2">Leaderboard</h3>
          <div className="space-y-4">
            {leaderboard.map((item, i) => (
              <LeaderboardItem key={item.username} rank={i + 1} name={item.username} points={item.points} />
            ))}
            {leaderboard.length === 0 && <p className="text-[10px] text-neural-text/40">Loading...</p>}
          </div>
        </Card>
      </aside>

      {/* Main Feed */}
      <div className="lg:col-span-3 space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neural-red/40" />
            <Input className="pl-10" placeholder="Cari diskusi..." />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="p-0 overflow-hidden hover:border-neural-neon/40 transition-all cursor-pointer group">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neural-red/10 border border-neural-red/20 flex items-center justify-center text-neural-neon font-bold">
                      {post.user?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{post.user}</p>
                      <p className="text-[10px] font-mono text-neural-text/40">{post.createdAt}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-neural-neon border border-neural-neon/30 px-2 py-1 uppercase">{post.category}</span>
                </div>

                <h3 className="text-xl font-orbitron text-white mb-3 group-hover:text-neural-neon transition-colors">{post.title}</h3>
                <div 
                  className="text-sm text-neural-text/70 mb-4 line-clamp-3 prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {post.image && (
                  <div className="mb-4 rounded border border-neural-red/10 overflow-hidden">
                    <img src={post.image} alt="Post" className="w-full h-48 object-cover opacity-80" referrerPolicy="no-referrer" />
                  </div>
                )}

                <div className="flex items-center gap-6 pt-4 border-t border-neural-red/10">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleLike(post.id); }}
                    className="flex items-center gap-2 text-xs font-mono text-neural-text/60 hover:text-neural-neon transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" /> {post.likes}
                  </button>
                  <button className="flex items-center gap-2 text-xs font-mono text-neural-text/60 hover:text-neural-neon transition-colors">
                    <MessageCircle className="w-4 h-4" /> {post.commentsCount || 0}
                  </button>
                </div>
              </div>
            </Card>
          ))}
          {posts.length === 0 && <p className="text-center text-neural-text/40 py-12">Belum ada diskusi</p>}
        </div>
      </div>

      {/* New Post Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl"
            >
              <Card className="p-0 overflow-hidden border-neural-neon/30">
                <div className="p-6 border-b border-neural-red/20 flex items-center justify-between bg-neural-red/5">
                  <h2 className="text-xl font-orbitron text-white">BUAT POST BARU</h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="text-neural-text/40 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block font-mono text-[10px] text-neural-text/40 uppercase mb-2">Judul Diskusi</label>
                    <Input 
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      placeholder="Masukkan judul yang menarik..." 
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-mono text-[10px] text-neural-text/40 uppercase mb-2">Kategori</label>
                      <select 
                        value={newPost.category}
                        onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                        className="w-full bg-neural-gray border border-neural-red/30 px-4 py-2 font-mono text-xs text-neural-text focus:outline-none focus:border-neural-neon"
                      >
                        {['Umum', 'Analisis Signal', 'Diskusi Berita', 'Tips AI', 'Chart Share'].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] text-neural-text/40 uppercase mb-2">Konten</label>
                    <div className="quill-dark">
                      <ReactQuill 
                        theme="snow"
                        value={newPost.content}
                        onChange={(content) => setNewPost({ ...newPost, content })}
                        modules={{
                          toolbar: [
                            ['bold', 'italic', 'underline'],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            ['clean']
                          ],
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-neural-red/10 flex gap-4 bg-neural-black/20">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3"
                  >
                    BATAL
                  </Button>
                  <Button 
                    onClick={handleCreatePost}
                    disabled={isSubmitting || !newPost.title || !newPost.content}
                    className="flex-1 py-3"
                  >
                    {isSubmitting ? 'MENGIRIM...' : 'PUBLIKASIKAN'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CategoryItem = ({ label, count, active }: any) => (
  <button className={cn(
    "w-full flex items-center justify-between px-3 py-2 text-xs font-mono transition-colors",
    active ? "text-neural-neon bg-neural-red/10" : "text-neural-text/60 hover:text-neural-neon hover:bg-neural-red/5"
  )}>
    <span>{label}</span>
    <span className="opacity-40">[{count}]</span>
  </button>
);

const LeaderboardItem = ({ rank, name, points }: any) => (
  <div className="flex items-center gap-3">
    <span className="font-mono text-neural-neon text-xs">0{rank}</span>
    <div className="flex-1">
      <p className="text-xs font-bold text-white">{name}</p>
      <div className="w-full h-1 bg-neural-gray mt-1 overflow-hidden">
        <div className="h-full bg-neural-red" style={{ width: `${(points / 1500) * 100}%` }}></div>
      </div>
    </div>
    <span className="font-mono text-[10px] text-neural-text/40">{points}</span>
  </div>
);
