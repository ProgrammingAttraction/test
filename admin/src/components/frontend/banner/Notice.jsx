import React, { useState, useEffect } from 'react';
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Header from '../../common/Header';

const Notice = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [notice, setNotice] = useState("");
  const [content, setContent] = useState("");

  // Fetch the notice on component mount
  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await axios.get(`${base_url}/admin/notice`);
        setNotice(res.data.notice?.content || ""); // Set existing content or empty
        setContent(res.data.notice?.content || ""); // Sync textarea with existing notice
      } catch (error) {
        console.error("Error fetching notice:", error);
      }
    };
    fetchNotice();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Notice content cannot be empty!");
      return;
    }

    try {
      const res = await axios.post(`${base_url}/admin/add-notice`, { content },{
        headers: {
             'Authorization': localStorage.getItem('genzz_token')
            },
      });
      setNotice(res.data.notice.content); // Update UI with new notice
      toast.success("Notice updated successfully!");
    } catch (error) {
      console.error("Error updating notice:", error);
      toast.error("Failed to update notice");
    }
  };

  return (
    <section className='w-full'>
      <Header />
      <div className="w-full font-bai overflow-y-auto">
        <Toaster />
        <section className="p-4">
          <div>
            <h1 className='text-[25px] font-[600] mb-[20px] text-gray-800'>Notice</h1>
            <form onSubmit={handleSubmit}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder='Notice'
                className='w-full h-[200px] border-[1px] border-gray-300 outline-blue-500 px-[15px] py-[10px] rounded-[5px] text-[16px] text-gray-800'
              />
              <button type="submit" className='w-full h-[50px] bg-blue-600 text-[16px] rounded-[5px] mt-[10px]'>
                Submit
              </button>
            </form>

            {notice && (
              <div className="mt-4 text-gray-600">
                <h2 className="text-xl font-semibold">Latest Notice</h2>
                <p className="mt-2">{notice}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
};

export default Notice;
