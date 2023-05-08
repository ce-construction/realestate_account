// Copyright (c) 2023, CE Construction and contributors
// For license information, please see license.txt



frappe.ui.form.on('Customer Payment Realestate', {
	booking_no(frm, cdt, cdn) {
        frappe.call({
            method:"frappe.client.get_value",
            args: {
                doctype:"Housing Booking",
                filters: {
                    name: frm.doc.booking_no
                },
                fieldname:["client_name","plot_no"]
            }, 
            callback: function(r) {
                 frm.doc.customer_name = r.message.client_name;
                 frm.refresh_field('customer_name');
                 frm.doc.plot_no = r.message.plot_no;
                 frm.refresh_field('plot_no');
                 
                 if (frm.is_new()){
                    frappe.call('get_payment_list', { name: frm.doc.booking_no})
                        .then(data => {
                            frm.clear_table("installment");
                            let i;
                            let receivable_total = 0 ;
                            for (i = 0; i < data.payment_list.length; i++) {
                                if(data.payment_list[i].receivable_amount > 0)
                                {
                                    var row = frm.add_child("installment");
                                    row.installment=data.payment_list[i].Installment;
                                    row.receivable_amount=data.payment_list[i].receivable_amount;
                                    row.remaining_amount=data.payment_list[i].receivable_amount;
                                    receivable_total = receivable_total + data.payment_list[i].receivable_amount;
                                }
                            } 
                            
                            frm.doc.total_remaining_balance  = receivable_total;
                            frm.refresh_fields("total_remaining_balance");
                            
                            frm.get_field("installment").grid.cannot_add_rows = true;
                            frm.refresh_fields("installment");
                        })
                        
                        
                        frappe.call({
                            method: 'frappe.client.get_value',
                            args: {
                                doctype: 'Plot List',
                                filters: [
                                    ['plot_name', '=', frm.doc.plot_no]
                                ],
                                fieldname:["project_name"]
                            },
                            callback: function(r) {
                                 frm.doc.project_name = r.message.project_name;
                                 frm.refresh_field('project_name');
                            }
                        })
                        
                 }
            }
        })
        
        
                 
        

       
        
    },
    payment_date(frm, cdt, cdn) {
        frappe.call({
                method:"frappe.client.get_value",
                args: {
                    doctype:"DateMiti",
                    filters: {
                        date: frm.doc.payment_date
                    },
                    fieldname:["nepali_miti"]
                }, 
                callback: function(r) {
                    frm.doc.payment_date__nepali_= r.message.nepali_miti.toString();
                    frm.refresh_field('payment_date__nepali_');
                }
        })
    },
    payment_date__nepali_(frm, cdt, cdn) {
        frappe.call({
                method:"frappe.client.get_value",
                args: {
                    doctype:"DateMiti",
                    filters: {
                        nepali_miti: frm.doc.payment_date__nepali_
                    },
                    fieldname:["date"]
                }, 
                callback: function(r) {
                    frm.doc.payment_date= r.message.date.toString();
                    frm.refresh_field('payment_date');
                }
        })
    },
    total_paid_amount(frm, cdt, cdn) {
        let ptotal = frm.doc.total_paid_amount;
        let total = 0;
        frm.doc.installment.forEach(d=>{
            if(ptotal > d.receivable_amount)
            {
               d.paid_amount = d.receivable_amount
               ptotal = ptotal - d.receivable_amount
            }
            else
            {
                d.paid_amount = ptotal
                ptotal = 0
            }
            
            d.remaining_amount = parseFloat(d.receivable_amount) - parseFloat(d.paid_amount);
        
            total = total + flt(d.paid_amount);
        })
        
        frm.refresh_field('installment');

        frm.doc.grand_total = total;
        frm.refresh_field('grand_total');
    }
})


frappe.ui.form.on("Customer Payment Installment", "paid_amount", function(frm, cdt, cdn) {
    let item = locals[cdt][cdn]; 
    if(item.paid_amount > item.receivable_amount)
    {
        frappe.model.set_value(cdt, cdn,'paid_amount',0) ;
        frappe.msgprint({
            title: __('Message'),
            indicator: 'green',
            message: __('paid amount is greater than receivable amount')
        });
    }
    else
    {
        let total = 0;
        frm.doc.installment.forEach(d=>{
        	total = total + parseFloat(d.paid_amount);
        	
        	frm.doc.total_paid_amount = total;
            frm.refresh_field('total_paid_amount');
        
        	frm.doc.grand_total = total;
            frm.refresh_field('grand_total');
        })
       
        let rAmount = parseFloat(item.receivable_amount) - parseFloat(item.paid_amount);
        frappe.model.set_value(cdt, cdn,'remaining_amount',rAmount) ;
    }
});






frappe.ui.form.on("Customer Payment Installment", {
    installment_remove: function(frm) {
        let total = 0;
        let receivable = 0;
        frm.doc.installment.forEach(d=>{
             total = total + flt(d.paid_amount);
             receivable = receivable + flt(d.receivable_amount);
        })
        
        frm.doc.total_remaining_balance  = receivable;
        frm.refresh_fields("total_remaining_balance");
        
        frm.doc.total_paid_amount = total;
        frm.refresh_field('total_paid_amount');
        
        frm.doc.grand_total = total;
        frm.refresh_field('grand_total');
    }
});


frappe.ui.form.on("Customer Payment Realestate",  'validate',  function(frm) {
    if(frm.doc.grand_total <= 0) {
        frappe.throw('Grand total is less than or equal to zero')
        frappe.validated = false;
    }
});

 frappe.ui.form.on('',  {
    validate: function(frm) {
        // calculate incentives for each person on the deal
        total_incentive = 0
        $.each(frm.doc.sales_team,  function(i,  d) {
            // calculate incentive
            var incentive_percent = 2;
            if(frm.doc.base_grand_total > 400) incentive_percent = 4;
            // actual incentive
            d.incentives = flt(frm.doc.base_grand_total) * incentive_percent / 100;
            total_incentive += flt(d.incentives)
        });
        frm.doc.total_incentive = total_incentive;
    }
})


