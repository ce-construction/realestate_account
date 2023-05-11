import requests
import frappe
@frappe.whitelist()
def get_payment_list():
    return frappe.db.sql(f"""select d.Installment,d.amount-ifnull((select sum(b.paid_amount) as paid_amount from `tabCustomer Payment Realestate` as a inner join `tabCustomer Payment Installment` as b on a.name=b.parent  where a.plot_no= c.plot_no and b.installment = d.installment order by a.creation desc),0)  as receivable_amount from `tabHousing Booking` as c inner join `tabInstallment Payment Plan` as d on c.name=d.parent where c.name = '2' order by d.idx asc""",as_dict=True)

    

