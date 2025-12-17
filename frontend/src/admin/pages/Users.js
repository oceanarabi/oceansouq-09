import React, { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import DataTable from '../components/DataTable';

const Icons = {
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
  Eye: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  UserCheck: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75l1.5 1.5 3-3" /></svg>,
  UserX: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>,
  Ban: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>,
};

const Users = () => {
  const { t, api, language, admin } = useAdmin();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: '', role: '', status: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pagination.page, limit: 20, ...(filters.search && { search: filters.search }), ...(filters.role && { role: filters.role }), ...(filters.status && { status: filters.status }) });
      const res = await api.get(`/api/admin/users?${params}`);
      setUsers(res.data.users);
      setPagination({ page: res.data.page, pages: res.data.pages, total: res.data.total });
    } catch (error) { console.error('Error fetching users:', error); }
    finally { setLoading(false); }
  }, [api, pagination.page, filters]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleStatusUpdate = async (userId, newStatus) => {
    try { await api.put(`/api/admin/users/${userId}/status`, { status: newStatus }); fetchUsers(); }
    catch (error) { console.error('Error updating user status:', error); }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try { await api.put(`/api/admin/users/${userId}/role?role=${newRole}`); fetchUsers(); }
    catch (error) { console.error('Error updating user role:', error); alert(error.response?.data?.detail || 'Error updating role'); }
  };

  const formatDate = (dateStr) => !dateStr ? '-' : new Date(dateStr).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const getRoleBadge = (role) => {
    const colors = { buyer: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400', seller: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400', admin: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400', super_admin: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' };
    const labels = { buyer: language === 'ar' ? 'مشتري' : 'Buyer', seller: language === 'ar' ? 'بائع' : 'Seller', admin: language === 'ar' ? 'مدير' : 'Admin', super_admin: language === 'ar' ? 'مدير عام' : 'Super Admin' };
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[role] || colors.buyer}`}>{labels[role] || role}</span>;
  };

  const getStatusBadge = (status) => {
    const colors = { active: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400', suspended: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400', banned: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' };
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status] || colors.active}`}>{t(status) || t('active')}</span>;
  };

  const columns = [
    { header: t('userName'), render: (row) => <div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center"><span className="text-white font-medium">{row.name?.charAt(0).toUpperCase() || 'U'}</span></div><div><p className="font-medium text-slate-900 dark:text-white">{row.name}</p><p className="text-xs text-slate-500">{row.id?.slice(0, 8)}</p></div></div> },
    { header: t('email'), accessor: 'email' },
    { header: t('role'), render: (row) => getRoleBadge(row.role) },
    { header: t('userStatus'), render: (row) => getStatusBadge(row.status) },
    { header: t('joinDate'), render: (row) => formatDate(row.created_at) },
    { header: t('actions'), render: (row) => <div className="flex items-center gap-2"><button onClick={() => { setSelectedUser(row); setShowModal(true); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-blue-500" title={t('viewDetails')}><Icons.Eye /></button>{row.status !== 'active' ? <button onClick={() => handleStatusUpdate(row.id, 'active')} className="p-2 hover:bg-green-100 dark:hover:bg-green-500/20 rounded-lg text-slate-500 hover:text-green-500" title={t('activate')}><Icons.UserCheck /></button> : <button onClick={() => handleStatusUpdate(row.id, 'suspended')} className="p-2 hover:bg-yellow-100 dark:hover:bg-yellow-500/20 rounded-lg text-slate-500 hover:text-yellow-500" title={t('suspend')}><Icons.UserX /></button>}{row.status !== 'banned' && <button onClick={() => handleStatusUpdate(row.id, 'banned')} className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg text-slate-500 hover:text-red-500" title={t('ban')}><Icons.Ban /></button>}</div> }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('users')}</h1><p className="text-slate-500 dark:text-slate-400">{language === 'ar' ? 'إدارة المستخدمين والصلاحيات' : 'Manage users and permissions'}</p></div></div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]"><div className="relative"><div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search /></div><input type="text" placeholder={t('searchUsers')} value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div></div>
          <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500"><option value="">{t('filterByRole')}</option><option value="buyer">{t('buyers')}</option><option value="seller">{t('sellers')}</option><option value="admin">{t('admins')}</option></select>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500"><option value="">{t('filterByStatus')}</option><option value="active">{t('active')}</option><option value="suspended">{t('suspended')}</option><option value="banned">{t('banned')}</option></select>
        </div>
      </div>
      <DataTable columns={columns} data={users} loading={loading} pagination={pagination} onPageChange={(page) => setPagination({ ...pagination, page })} emptyMessage={t('noUsers')} />
      {showModal && selectedUser && <UserDetailModal user={selectedUser} onClose={() => { setShowModal(false); setSelectedUser(null); }} onStatusChange={handleStatusUpdate} onRoleChange={handleRoleUpdate} currentAdmin={admin} />}
    </div>
  );
};

const UserDetailModal = ({ user, onClose, onStatusChange, onRoleChange, currentAdmin }) => {
  const { t, language, api } = useAdmin();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserDetails = useCallback(async () => {
    try { const res = await api.get(`/api/admin/users/${user.id}`); setUserDetails(res.data); }
    catch (error) { console.error('Error fetching user details:', error); }
    finally { setLoading(false); }
  }, [api, user.id]);

  useEffect(() => { fetchUserDetails(); }, [fetchUserDetails]);

  const formatCurrency = (amount) => new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {loading ? <div className="animate-pulse space-y-4"><div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl"></div><div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-xl"></div></div> : <>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center"><span className="text-white font-bold text-2xl">{user.name?.charAt(0).toUpperCase() || 'U'}</span></div>
              <div className="flex-1"><h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h2><p className="text-slate-500">{user.email}</p><div className="flex gap-2 mt-2"><select value={user.role} onChange={(e) => onRoleChange(user.id, e.target.value)} disabled={currentAdmin?.role !== 'super_admin'} className="px-3 py-1 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700"><option value="buyer">{language === 'ar' ? 'مشتري' : 'Buyer'}</option><option value="seller">{language === 'ar' ? 'بائع' : 'Seller'}</option><option value="admin">{language === 'ar' ? 'مدير' : 'Admin'}</option><option value="super_admin">{language === 'ar' ? 'مدير عام' : 'Super Admin'}</option></select><select value={user.status || 'active'} onChange={(e) => onStatusChange(user.id, e.target.value)} className="px-3 py-1 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700"><option value="active">{t('active')}</option><option value="suspended">{t('suspended')}</option><option value="banned">{t('banned')}</option></select></div></div>
            </div>
            {userDetails?.loyalty && <div className="bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl p-4 mb-6 text-white"><p className="text-sm opacity-90">{language === 'ar' ? 'نقاط الولاء' : 'Loyalty Points'}</p><p className="text-3xl font-bold">{userDetails.loyalty.points || 0}</p><p className="text-sm capitalize">{userDetails.loyalty.tier || 'Bronze'} {language === 'ar' ? 'المستوى' : 'Tier'}</p></div>}
            {userDetails?.orders?.length > 0 && <div className="mb-6"><h3 className="font-semibold text-slate-900 dark:text-white mb-3">{language === 'ar' ? 'آخر الطلبات' : 'Recent Orders'}</h3><div className="space-y-2">{userDetails.orders.slice(0, 5).map((order) => <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl"><div><p className="font-medium text-slate-900 dark:text-white">#{order.id?.slice(0, 8)}</p><p className="text-xs text-slate-500">{order.status}</p></div><p className="font-medium text-slate-900 dark:text-white">{formatCurrency(order.total)}</p></div>)}</div></div>}
            {userDetails?.products?.length > 0 && <div className="mb-6"><h3 className="font-semibold text-slate-900 dark:text-white mb-3">{language === 'ar' ? 'منتجات البائع' : 'Seller Products'}</h3><div className="grid grid-cols-2 gap-3">{userDetails.products.slice(0, 4).map((product) => <div key={product.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl"><img src={product.image_url || 'https://via.placeholder.com/48'} alt={product.title} className="w-12 h-12 rounded-lg object-cover" /><div className="flex-1 min-w-0"><p className="font-medium text-slate-900 dark:text-white truncate">{product.title}</p><p className="text-sm text-slate-500">{formatCurrency(product.price)}</p></div></div>)}</div></div>}
            <button onClick={onClose} className="w-full py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors">{t('cancel')}</button>
          </>}
        </div>
      </div>
    </div>
  );
};

export default Users;
