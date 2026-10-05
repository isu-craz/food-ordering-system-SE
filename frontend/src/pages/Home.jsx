import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, UtensilsCrossed, ShoppingBag, ChefHat, Bike, MessageSquareWarning, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  const modules = [
    {
      member: 'Member 1',
      title: 'Branch Management',
      icon: <MapPin className="w-6 h-6 text-orange-600" />,
      desc: 'Multi-branch registration, operating hours, delivery coverage areas, and operational performance statistics.',
      link: '/branches',
      roles: ['OPS_MANAGER', 'ADMIN'],
      color: 'border-orange-200 hover:border-orange-400 bg-orange-50/30',
    },
    {
      member: 'Member 2',
      title: 'Menu Management',
      icon: <UtensilsCrossed className="w-6 h-6 text-amber-600" />,
      desc: 'Branch-specific food categories, menu items, dynamic size variations, pricing adjustments, and availability toggles.',
      link: '/menu-admin',
      roles: ['BRANCH_MANAGER', 'ADMIN'],
      color: 'border-amber-200 hover:border-amber-400 bg-amber-50/30',
    },
    {
      member: 'Member 3',
      title: 'Customer Ordering',
      icon: <ShoppingBag className="w-6 h-6 text-emerald-600" />,
      desc: 'Pickup vs. Delivery flows, address book management, shopping cart CRUD, checkout, live order tracking, and cancellation.',
      link: '/order',
      roles: ['CUSTOMER'],
      color: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/30',
    },
    {
      member: 'Member 4',
      title: 'Order Fulfillment',
      icon: <ChefHat className="w-6 h-6 text-blue-600" />,
      desc: 'Live incoming kitchen queue, order confirm/reject with reasons, prep time estimation, and delivery rider assignment.',
      link: '/kitchen-queue',
      roles: ['BRANCH_MANAGER', 'ADMIN'],
      color: 'border-blue-200 hover:border-blue-400 bg-blue-50/30',
    },
    {
      member: 'Member 5',
      title: 'Delivery Management',
      icon: <Bike className="w-6 h-6 text-purple-600" />,
      desc: 'Rider availability management, assigned tasks acceptance, delivery status progression (Out for Delivery -> Delivered), and history.',
      link: '/rider-portal',
      roles: ['RIDER'],
      color: 'border-purple-200 hover:border-purple-400 bg-purple-50/30',
    },
    {
      member: 'Member 6',
      title: 'Complaint & Review',
      icon: <MessageSquareWarning className="w-6 h-6 text-rose-600" />,
      desc: 'Post-delivery 1-5 star ratings & reviews CRUD, order complaints lifecycle (Pending -> In Progress -> Resolved), and CS analytics.',
      link: '/supervisor',
      roles: ['SUPERVISOR', 'ADMIN'],
      color: 'border-rose-200 hover:border-rose-400 bg-rose-50/30',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-orange-700/10 mb-12">
        <div className="max-w-3xl">

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
            Spice Avenue Restaurant Network
          </h1>
          <p className="text-base sm:text-lg text-orange-100 mb-8 leading-relaxed">
            A complete enterprise web-based food ordering and multi-branch management platform powered by Spring Boot 3 REST APIs, MySQL, and React.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/order"
              className="px-6 py-3 bg-white text-orange-700 font-bold rounded-xl shadow-lg hover:bg-orange-50 transition-all flex items-center gap-2 text-sm"
            >
              <ShoppingBag className="w-4 h-4" /> Start Customer Order
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 bg-orange-800/60 hover:bg-orange-800 text-white font-bold rounded-xl border border-white/20 transition-all flex items-center gap-2 text-sm"
            >
              <ShieldCheck className="w-4 h-4" /> Switch Role / Test Accounts
            </Link>
          </div>
        </div>
      </div>

      {/* Six Member Portal Modules */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Team Member Modules & Portals</h2>
        <p className="text-sm text-stone-600">Select any module below to test its full-stack implementation and viva requirements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((m, idx) => (
          <div
            key={idx}
            className={`border rounded-2xl p-6 flex flex-col justify-between transition-all hover:shadow-md ${m.color}`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-stone-100">
                  {m.icon}
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-stone-900 text-white tracking-wide">
                  {m.member}
                </span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">{m.title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed mb-6">{m.desc}</p>
            </div>

            <Link
              to={m.link}
              className="flex items-center justify-between px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-800 hover:border-orange-500 hover:text-orange-600 transition-all"
            >
              <span>Open Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
