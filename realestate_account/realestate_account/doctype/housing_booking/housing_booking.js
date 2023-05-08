// Copyright (c) 2023, CE Construction and contributors
// For license information, please see license.txt



function calculation(frm, cdt, cdn) {
            var total_cost = frm.doc.unit_cost + frm.doc.parking_cost + frm.doc.direction_premium_cost + frm.doc.paint_premium_cost
            console.log(frm.doc.paint_premium_cost);
            frm.doc.total_cost = total_cost
            frm.refresh_field('total_cost');
            
            var grand_total = frm.doc.total_cost - (frm.doc.total_cost * (frm.doc._discount_on_total_cost /100))
            frm.doc.grand_total = grand_total
            frm.refresh_field('grand_total');
            
            var difference = frm.doc.booking_grand_total - frm.doc.community_total - frm.doc.grand_total
            frm.doc.difference = difference
            
            frm.refresh_field('difference');
}

frappe.ui.form.on("Housing Booking", "refresh", function(frm) {
    frm.set_df_property("booking_no", "read_only", frm.is_new() ? 0 : 1);
    frm.set_df_property("plot_no", "read_only", frm.is_new() ? 0 : 1);
    //frm.set_df_property("client_name", "read_only", frm.is_new() ? 0 : 1);
    
    //frm.set_df_property("booking_date", "read_only", frm.is_new() ? 0 : 1);
    //frm.set_df_property("booking_date__bs_", "read_only", frm.is_new() ? 0 : 1);
    //frm.set_df_property("handover_date", "read_only", frm.is_new() ? 0 : 1);
    //frm.set_df_property("handover_date__bs_", "read_only", frm.is_new() ? 0 : 1);
});

frappe.ui.form.on('Housing Booking', {
    onload: function(frm){
        
        
        if (frm.is_new()){
            frappe.call('get_installment_list')
            .then(data => {
                frm.clear_table("payment_schedule");
               
                let i;
              
                for (i = 0; i < data.Installment_List.length; i++) {
                    var row = frm.add_child("payment_schedule");
                    row.installment=data.Installment_List[i].installment_name;
                    row.installment_type=data.Installment_List[i].installment_type;
                }
                
               
                
                
        
                frm.refresh_fields("payment_schedule");
            })
        }
     
    },
    plot_no(frm,cdt,cdn){
         frappe.call({
                method:"frappe.client.get_value",
                args: {
                    doctype:"Plot List",
                    filters: {
                        plot_name: frm.doc.plot_no
                    },
                    fieldname:["project_name"]
                }, 
                callback: function(r) {
                    frappe.call({
                            method:"frappe.client.get_value",
                            args: {
                                doctype:"Project",
                                filters: {
                                    project_name: r.message.project_name.toString()
                                },
                                fieldname:["searchkey"]
                            }, 
                            callback: function(r) {
                                frm.doc.shortkey= r.message.searchkey.toString();
                                frm.refresh_field('shortkey');
                            }
                    })
                }
        })
    },
	paint_premium_cost(frm, cdt, cdn) {
        calculation(frm, cdt, cdn)
    },
	total_cost(frm, cdt, cdn) {
        calculation(frm, cdt, cdn)
    },
    _discount_on_total_cost(frm, cdt, cdn) {
         calculation(frm, cdt, cdn)
    },
    unit_cost(frm, cdt, cdn) {
         calculation(frm, cdt, cdn)
    },
    parking_cost(frm, cdt, cdn) {
         calculation(frm, cdt, cdn)
    },
    direction_premium_cost(frm, cdt, cdn) {
         calculation(frm, cdt, cdn)
    },
    booking_date(frm, cdt, cdn) {
        frappe.call({
                method:"frappe.client.get_value",
                args: {
                    doctype:"DateMiti",
                    filters: {
                        date: frm.doc.booking_date
                    },
                    fieldname:["nepali_miti"]
                }, 
                callback: function(r) {
                    frm.doc.booking_date__bs_= r.message.nepali_miti.toString();
                    frm.refresh_field('booking_date__bs_');
                }
        })
    },
    handover_date(frm, cdt, cdn) {
        frappe.call({
                method:"frappe.client.get_value",
                args: {
                    doctype:"DateMiti",
                    filters: {
                        date: frm.doc.handover_date
                    },
                    fieldname:["nepali_miti"]
                }, 
                callback: function(r) {
                    frm.doc.handover_date__bs_= r.message.nepali_miti.toString();
                    frm.refresh_field('handover_date__bs_');
                }
        })
    },
    handover_date__bs_(frm, cdt, cdn) {
        frappe.call({
                method:"frappe.client.get_value",
                args: {
                    doctype:"DateMiti",
                    filters: {
                        nepali_miti: frm.doc.handover_date__bs_
                    },
                    fieldname:["date"]
                }, 
                callback: function(r) {
                    frm.doc.handover_date= r.message.date.toString();
                    frm.refresh_field('handover_date');
                }
        })
    },
    booking_date__bs_(frm, cdt, cdn) {
        frappe.call({
                method:"frappe.client.get_value",
                args: {
                    doctype:"DateMiti",
                    filters: {
                        nepali_miti: frm.doc.booking_date__bs_
                    },
                    fieldname:["date"]
                }, 
                callback: function(r) {
                    frm.doc.booking_date= r.message.date.toString();
                    frm.refresh_field('booking_date');
                }
        })
    }
    
    
    
})

frappe.ui.form.on('Housing Booking',  'validate',  function(frm) {
    if(frm.doc.difference != '0') {
        frappe.throw('Amount of Installment Total and Grand Total is not matched')
        frappe.validated = false;
    }
    
    
    //if (frm.doc.handover_date < get_today()) {
            //frappe.throw(__("Please select a From Date from the future."));
            //frappe.validated = false;
    //}
   
    frm.doc.payment_schedule.forEach(d=>{
    	if(parseFloat(d.amount) <= parseFloat(0))
    	{
            frappe.throw('Please Remove 0 Amount Row in Payment Schedule');
            frappe.validated = false;
    	}
    })
});

frappe.ui.form.on("Installment Payment Plan", "date_nepali", function(frm, cdt, cdn) {
    let item = locals[cdt][cdn]; 
     frappe.call({
                method:"frappe.client.get_value",
                args: {
                    doctype:"DateMiti",
                    filters: {
                        nepali_miti: item.date_nepali
                    },
                    fieldname:["date"]
                }, 
                callback: function(r) {
                    
                    frappe.model.set_value(cdt, cdn,'date',r.message.date.toString()) ;
                   
                }
        })
    
});


frappe.ui.form.on("Installment Payment Plan", "date", function(frm, cdt, cdn) {
    let item = locals[cdt][cdn]; 
     frappe.call({
                method:"frappe.client.get_value",
                args: {
                    doctype:"DateMiti",
                    filters: {
                        date: item.date
                    },
                    fieldname:["nepali_miti"]
                }, 
                callback: function(r) {
                    frappe.model.set_value(cdt, cdn,'date_nepali',r.message.nepali_miti.toString()) ;
                }
        })
    
});

frappe.ui.form.on("Installment Payment Plan", "amount", function(frm, cdt, cdn) {
        
        let booking_total = 0;
        let contract_total = 0;
        let installment_total = 0;
        let community_total = 0;
        let booking_grand_total = 0;
        
        frm.doc.payment_schedule.forEach(d=>{
            
            frappe.call({
                method:"frappe.client.get_value",
                args: {
                    doctype:"Installment",
                    filters: {
                        installment_name: d.installment
                    },
                    fieldname:["installment_type"]
                }, 
                callback: function(r) {
                    
                    let type = r.message.installment_type.toString();
                  
                    
                    if(type == "Booking") { booking_total = booking_total + flt(d.amount); }
                    if(type == "Contract") { contract_total = contract_total +  flt(d.amount); }
                    if(type == "Installment") { installment_total = installment_total +  flt(d.amount);  }
                    if(type == "Community Deposit") { community_total = community_total +  flt(d.amount); }
                    booking_grand_total = booking_grand_total +  flt(d.amount);
                    
                    frm.doc.booking_total = booking_total;
                    frm.refresh_field('booking_total');
                    frm.doc.contract_total = contract_total;
                    frm.refresh_field('contract_total');
                    frm.doc.installment_total = installment_total;
                    frm.refresh_field('installment_total');
                    frm.doc.community_total = community_total;
                    frm.refresh_field('community_total');
                    frm.doc.booking_grand_total = booking_grand_total;
                    frm.refresh_field('booking_grand_total');
                    
                    calculation(frm, cdt, cdn)
                }
            })
        })
        
      
        
        
        
    
});


frappe.ui.form.on("Installment Payment Plan", {
    payment_schedule_remove: function(frm, cdt, cdn) {

        let booking_total = 0;
        let contract_total = 0;
        let installment_total = 0;
        let community_total = 0;
        let booking_grand_total = 0;
        
         frm.doc.payment_schedule.forEach(d=>{
            
            frappe.call({
                method:"frappe.client.get_value",
                args: {
                    doctype:"Installment",
                    filters: {
                        installment_name: d.installment
                    },
                    fieldname:["installment_type"]
                }, 
                callback: function(r) {
                    
                    let type = r.message.installment_type.toString();
                  
                    
                    if(type == "Booking") { booking_total = booking_total + flt(d.amount); }
                    if(type == "Contract") { contract_total = contract_total +  flt(d.amount); }
                    if(type == "Installment") { installment_total = installment_total +  flt(d.amount);  }
                    if(type == "Community Deposit") { community_total = community_total +  flt(d.amount); }
                    booking_grand_total = booking_grand_total +  flt(d.amount);
                    
                    frm.doc.booking_total = booking_total;
                    frm.refresh_field('booking_total');
                    frm.doc.contract_total = contract_total;
                    frm.refresh_field('contract_total');
                    frm.doc.installment_total = installment_total;
                    frm.refresh_field('installment_total');
                    frm.doc.community_total = community_total;
                    frm.refresh_field('community_total');
                    frm.doc.booking_grand_total = booking_grand_total;
                    frm.refresh_field('booking_grand_total');
                    
                    calculation(frm, cdt, cdn)
                }
            })
        })
        
       


    }
});


