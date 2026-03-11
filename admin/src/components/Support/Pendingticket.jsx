import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { RiComputerLine } from "react-icons/ri";
import Header from '../common/Header';

const Pendingticket = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const tickets = [
    { subject: "[Ticket#660018] teset", submittedBy: "Caner GR", status: "Open", priority: "High", lastReply: "4 days ago" },
    { subject: "[Ticket#217302] Fgh", submittedBy: "VN V789", status: "Open", priority: "High", lastReply: "1 week ago" },
    { subject: "[Ticket#400371] fggggggggggggggg", submittedBy: "Bhagwan Vaishnav", status: "Open", priority: "High", lastReply: "2 months ago" },
    { subject: "[Ticket#862596] Deposit issue", submittedBy: "Hammad ali", status: "Open", priority: "High", lastReply: "2 months ago" },
    { subject: "[Ticket#790313] Lorem Ipsum is simply dummy te...", submittedBy: "Bhagwan Vaishnav", status: "Open", priority: "High", lastReply: "2 months ago" },
    { subject: "[Ticket#775606] ssssssssss", submittedBy: "Bhagwan Vaishnav", status: "Open", priority: "High", lastReply: "2 months ago" },
    { subject: "[Ticket#14563672] Hi", submittedBy: "Andrew T", status: "Open", priority: "Medium", lastReply: "2 months ago" },
    { subject: "[Ticket#145444] ssssssssss", submittedBy: "Bhagwan Vaishnav", status: "Open", priority: "Low", lastReply: "2 months ago" },
    { subject: "[Ticket#9934697] Hindi", submittedBy: "Hindi", status: "Open", priority: "Medium", lastReply: "2 months ago" },
    { subject: "[Ticket#896650] sa", submittedBy: "Ipnu Alpri Yansyah", status: "Open", priority: "High", lastReply: "2 months ago" },
    { subject: "[Ticket#870742] test", submittedBy: "test test", status: "Open", priority: "Low", lastReply: "3 months ago" }
  ];

  const filteredTickets = tickets.filter(ticket => 
    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full font-bai">
      <Header />
      <section className="p-4">
        <div className="p-6">
          <div className="w-full p-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-semibold text-gray-800 mb-6">Support Tickets</h1>
              <div className="relative w-[30%]">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse shadow-xl bg-white border-[1px] border-[#eee] rounded-md overflow-hidden">
                <thead>
                  <tr className="bg-[#4634FF] text-white">
                    <th className="py-3 px-4 text-left">Subject</th>
                    <th className="py-3 px-4 text-left">Submitted By</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Priority</th>
                    <th className="py-3 px-4 text-left">Last Reply</th>
                    <th className="py-3 px-4 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket, index) => (
                    <tr key={index} className="border-b even:bg-gray-50">
                      <td className="py-3 px-4 text-gray-800">{ticket.subject}</td>
                      <td className="py-3 px-4 text-gray-800">{ticket.submittedBy}</td>
                      <td className="py-3 px-4 text-gray-800">
  <span
    className={`px-[20px] py-[5px] text-[15px] rounded-full border-[1px] 
      ${ticket.status === 'Open' ? 'bg-blue-100 border-blue-400 text-blue-500' : ''} 
      ${ticket.status === 'In Progress' ? 'bg-yellow-100 border-yellow-400 text-yellow-500' : ''} 
      ${ticket.status === 'Closed' ? 'bg-green-100 border-green-400 text-green-500' : ''}`}
  >
    {ticket.status}
  </span>
</td>

                      <td className="py-3 px-4 text-gray-800">
  <span
    className={`px-[20px] py-[5px] text-[15px] rounded-full border-[1px] 
      ${ticket.priority === 'High' ? 'bg-red-100 border-red-400 text-red-500' : ''} 
      ${ticket.priority === 'Medium' ? 'bg-yellow-100 border-yellow-400 text-yellow-500' : ''} 
      ${ticket.priority === 'Low' ? 'bg-blue-100 border-blue-400 text-blue-500' : ''}`}
  >
    {ticket.priority}
  </span>
</td>

                      <td className="py-3 px-4 text-gray-800">{ticket.lastReply}</td>
                      <td className="py-3 px-4 flex items-center space-x-2">
                        <button className="flex items-center border-[1px] border-blue-500 px-[10px] py-[4px] rounded-[5px] text-blue-500 hover:text-blue-600">
                          <RiComputerLine className="mr-1" /> Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pendingticket;
