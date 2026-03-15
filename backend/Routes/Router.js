const express=require("express");
const Bannermodel = require("../Models/Bannermodel");
const Noticemodel = require("../Models/Noticemodel");
const Categorymodel = require("../Models/CategoryModel");
const GameModel = require("../Models/GameModel");
const Providermodel = require("../Models/Providermodel");
const HighlightGamesModel = require("../Models/HighlightGamesModel");
const Router=express.Router();

Router.get("/all-sliders",async(req,res)=>{
    try {
        const allslider=await Bannermodel.find();
        if(!allslider){
              return res.send({success:false,message:"Slider did not find!"})
        }
        res.send({success:true,data:allslider})
    } catch (error) {
        console.log(error)
    }
})
// ------------------notice----------------------------------
Router.get("/notice",async(req,res)=>{
    try {
        const notice=await Noticemodel.find();
        if(!notice){
              return res.send({success:false,message:"notice did not find!"})
        }
        res.send({success:true,data:notice})
    } catch (error) {
        console.log(error)
    }
})

// --------------------all-category---------------------------------
Router.get("/categories", async (req, res) => {
  try {

    const categories = await Categorymodel.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});
Router.get("/games", async (req, res) => {
  try {

    const games = await GameModel.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: games.length,
      data: games
    });
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// -------------------all-games-category----------------------
Router.get("/hot-games", async (req, res) => {
  try {

    const games = await GameModel.find({category:"গরম"}).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: games.length,
      data: games
    });
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

Router.get("/live-games", async (req, res) => {
  try {

    const games = await GameModel.find({category:"লাইভ"}).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: games.length,
      data: games
    });
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});
Router.get("/all-providers", async (req, res) => {
  try {
    const providers = await Providermodel.find();
    res.status(200).json(providers);
  } catch (error) {
    console.error("Error fetching providers:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});


Router.get("/highlight-games", async (req, res) => {
  try {
    // Get only active highlight games
    const highlightGames = await HighlightGamesModel.find({ status: "active" }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: highlightGames.length,
      data: highlightGames,
    });
  } catch (error) {
    console.error("Error fetching highlight games:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});


module.exports=Router;