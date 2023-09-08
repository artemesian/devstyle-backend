const Collection = require("../models/collection_model.js");
const Goodie = require("../models/goodie_model.js");
const cloudinary = require("../cloudinary_config");
const fs = require("fs");

module.exports.createCollection = async (req, res, next) => {
  let { title, slug, colors } = req.body;
  try {
    const uploader = async (path) =>
      await cloudinary.uploads(path, `DevStyle/Collections`);
    const { path } = req.file;
    const newPath = await uploader(path);
    fs.unlinkSync(path);
    if (!newPath) {
      return res.status(500).json({ message: "sorry an error occur" });
    }
    const collection = new Collection({
      title,
      slug,
      colors,
      image: newPath,
    });

    collection
      .save()
      .then((_) => {
        res.status(200).json({
          message: "Collection created successfully !!",
        });
      })
      .catch((error) => {
        console.log(error.message);
        return res.status(500).json({
          message: "Collection not created",
        });
      });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "an error occur !",
    });
  }
};

module.exports.getAllCollections = (req, res, next) => {
  Collection.find({ show: true })
    .then((results) => {
      res.status(200).json({ message: results });
    })
    .catch((error) => {
      console.log(error.message);

      res.status(500).json({ message: error.message });
    });
};

module.exports.getOneCollection = (req, res, next) => {
  Collection.findOne({ _id: req.params.id })
    .then((result) => {
      res.status(200).json({ message: result });
    })
    .catch((error) => {
      console.log(error.message);

      res.status(500).json({ message: error.message });
    });
};

module.exports.getOneCollectionAndGoodies = (req, res, next) => {
  Collection.findOne({ slug: req.params.slug, show: true })
    .then((collection) => {
      Goodie.find({ fromCollection: collection._id, show: true })
        .then((goodies) => {
          res.status(200).json({ message: { collection, goodies } });
        })
        .catch((error) => {
          console.log(error.message);

          res.status(500).json({ message: error.message });
        });
    })
    .catch((error) => {
      console.log(error.message);

      res.status(500).json({ message: error.message });
    });
};

module.exports.updateOneCollection = (req, res, next) => {
  Collection.findOneAndUpdate(
    { _id: req.params.id },
    { ...req.body },
    { new: true }
  )
    .then((result) => {
      res.status(200).json({ message: result });
    })
    .catch((error) => {
      console.log(error.message);

      res.status(500).json({ message: error.message });
    });
};

module.exports.deleteOneCollection = (req, res, next) => {
  Collection.deleteOne({ _id: req.params.id })
    .then((result) => {
      res.status(200).json({ message: result });
    })
    .catch((error) => {
      console.log(error.message);

      res.status(500).json({ message: error.message });
    });
};

module.exports.updateCollectionImage = async (req, res, next) => {
  let id = req.params.id;
  const uploader = async (path) =>
    await cloudinary.uploads(path, `DevStyle/Collections`);
  const { path } = req.file;
  const newPath = await uploader(path);
  fs.unlinkSync(path);
  if (!newPath) res.status(500).json({ message: "sorry an error occured" });
  await Collection.findOneAndUpdate(
    { _id: id },
    {
      image: newPath,
      ...req.body,
    },
    { new: true }
  )
    .then((result) => {
      res.status(200).json({
        message: `Collection Image was updated !`,
      });
    })
    .catch((error) =>
      res.status(404).json({ message: "Collection does not exist" })
    );
};

module.exports.updateViews = (req, res, next) => {
  Collection.findOneAndUpdate(
    { slug: req.params.slug },
    { $inc: { views: 1 } },
    { new: 1 }
  )
    .then((result) => res.status(200).json({ message: "Success" }))
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: "Error" });
    });
};
