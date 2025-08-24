const router = require("express") .Router();
const Email = require("../models/Email");
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    safe: true,
    auth: {
      user: 'ganjanamurad@gmail.com',
      pass: 'hruvdjoawcbjmdie'
    }
  });

router.post("/save-email", async (req, res)=>{
    console.log(req.body.email)
    if(req.body.email == null || req.body.email=="") {
        return res.status(500).send(JSON.stringify("email is required"));
    }

    var email = new Email({
        email: req.body.email,
        newsletter: req.body.newsletter || true,
    })

    try {
        const flag = await email.save();
        if(flag) {
            var mailOptions = {
                from: 'seo@elitegaming.store',
                to: req.body.email,
                subject: 'Welcome to Ecommerece Gaming Store',
                html: `<p>Thanks for subscribing to Ecommerece Gaming Store!</p>
                    <br><p>We offer best quality gaming products.</p><br>
                    <p>Thanks & Regards<br>
                    Ambreena Kanwal</p>`
            };
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                  return res.status(200).send(JSON.stringify("email saved!"));
                } else {
                  console.log('Email sent: ' + info.response);
                  return res.status(200).send(JSON.stringify("email saved successfully"));
                }
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send(JSON.stringify("error occured saving email, try again later"));
    }
});

router.get("/get-emails", (req,res)=>{
    Email.find((err,e)=>{
        if(err) {
            return res.status(500).send(JSON.stringify("no emails found"));
        }

        return res.status(200).send(e);
    })
})

module.exports = router;