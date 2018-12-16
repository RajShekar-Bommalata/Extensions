package eureQa;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

public class Task {

    public static void main(String[] args) throws InterruptedException {
	System.setProperty("webdriver.chrome.driver", "C:\\Users\\RaJa\\Downloads\\chromedriver_win32\\chromedriver.exe");
	WebDriver driver = new ChromeDriver();
	driver.get("https://acmetech.eureqatest.com");
	Thread.sleep(10000);
	String[]  target = {"id=loginForm:password","class=loginForm:userId","css=loginForm:userId","//input[@id=\"loginForm:userId\"]"};
	List<String> locators = Arrays.asList(target);
	String loc_type="";
	for(int index=0;index<1;index++) {
	    loc_type=target[index].substring(0,2);

		driver.findElement(By.id("loginForm:password")).sendKeys("password");
	 WebElement selector = findElement(target[index],loc_type,driver);
	 System.out.println(selector);
	    //target[index].indexOf("=")
	    if(selector!=null) {
		selector.sendKeys("hello");
	    }
	    else {
		break;
	    }
	    
	}
	
	
	//System.out.println(driver.getTitle());
	
    }
    
    public static WebElement findElement(String target, String type, WebDriver driver) {
	boolean isLocatorValid =  false;
	WebElement selector = null;
	
	switch(type){  
	    //Case statements  
	    case "id": try{
		System.out.println(target.substring(target.indexOf("=")+1));
		String password="loginForm:password";
		driver.findElement(By.id("loginForm:password")).sendKeys("password");
		selector=driver.findElement(By.id(target.substring(target.indexOf("=")+1)));
		selector.sendKeys("sfsfds");
	    }
	    catch(Exception e) {
		selector=null;
	    }
	    break;  
	    case "cs": System.out.println(target);  
	    break;  
	    case "cl": System.out.println(target);  
	    break;
	    case "//": System.out.println(target);  
	    break;
	    case "na": System.out.println(target);  
	    break;
	    case "se": System.out.println(target);  
	    break;
	    case "xp": System.out.println(target);  
	    break;
	    case "li": System.out.println(target);  
	    break;
	    case "in": System.out.println(target);  
	    break;	    
	    default:System.out.println("custom");  
	    } 
	
	return selector;
	
    }
    

}
